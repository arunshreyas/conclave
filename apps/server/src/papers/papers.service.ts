import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class PapersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsService: QuestionsService,
  ) {}

  async generatePaper(
    userId: string,
    dto: {
      title?: string;
      subject?: string;
      chapter?: string;
      topics?: string[];
      difficulty?: string;
      durationMinutes?: number;
      totalQuestions?: number;
    },
  ) {
    const totalCount = dto.totalQuestions && dto.totalQuestions > 0 ? dto.totalQuestions : 30;
    const duration = dto.durationMinutes && dto.durationMinutes > 0 ? dto.durationMinutes : 45;
    const difficulty = dto.difficulty || 'MIXED';

    const where: any = {};
    if (dto.subject && dto.subject !== 'ALL' && dto.subject !== 'Mixed') {
      where.subject = dto.subject;
    }
    if (dto.chapter && dto.chapter !== 'Mixed') {
      where.chapter = dto.chapter;
    }
    if (difficulty !== 'MIXED') {
      where.difficulty = difficulty;
    }

    // Get previous attempts to avoid overused questions
    const previousAttempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      select: { questionId: true },
    });
    const attemptedIds = previousAttempts.map((a) => a.questionId);

    // Fetch candidate questions
    let candidates = await this.prisma.questions.findMany({
      where,
      take: totalCount * 4,
    });

    if (candidates.length < totalCount) {
      // Fallback: relax difficulty constraint
      candidates = await this.prisma.questions.findMany({
        where: dto.subject && dto.subject !== 'ALL' ? { subject: dto.subject } : {},
        take: totalCount * 4,
      });
    }

    if (candidates.length === 0) {
      throw new NotFoundException('Not enough matching questions found to generate paper.');
    }

    // Prioritize unattempted questions or weak topics
    const weakTopics = await this.questionsService.getUserWeakTopics(userId);
    const weakTopicNames = new Set(weakTopics.map((w) => w.topic.toLowerCase()));

    const weightedCandidates = candidates.sort((a, b) => {
      const aIsWeak = weakTopicNames.has((a.chapter || '').toLowerCase()) ? 1 : 0;
      const bIsWeak = weakTopicNames.has((b.chapter || '').toLowerCase()) ? 1 : 0;
      const aIsAttempted = attemptedIds.includes(a.id) ? 1 : 0;
      const bIsAttempted = attemptedIds.includes(b.id) ? 1 : 0;

      // Higher score comes first
      const scoreA = aIsWeak * 2 - aIsAttempted;
      const scoreB = bIsWeak * 2 - bIsAttempted;
      return scoreB - scoreA;
    });

    const selectedQuestions = weightedCandidates.slice(0, totalCount);

    const paperTitle =
      dto.title ||
      `${dto.subject || 'Full Mock'} - ${dto.chapter || 'Practice Paper'} (${new Date().toLocaleDateString()})`;

    const paper = await this.prisma.paper.create({
      data: {
        userId,
        title: paperTitle,
        subject: dto.subject || 'Mixed',
        chapter: dto.chapter || 'Mixed',
        durationMinutes: duration,
        totalQuestions: selectedQuestions.length,
        difficulty,
        syllabusTopics: dto.topics || [],
        questions: {
          create: selectedQuestions.map((q, idx) => ({
            questionId: q.id,
            orderIndex: idx + 1,
            marks: 4,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    const questionMap = new Map(selectedQuestions.map((q) => [q.id, q]));

    return {
      paperId: paper.id,
      title: paper.title,
      durationMinutes: paper.durationMinutes,
      totalQuestions: paper.totalQuestions,
      questions: paper.questions
        .map((pq) => {
          const q = questionMap.get(pq.questionId);
          if (!q) return null;
          return {
            paperQuestionId: pq.id,
            questionId: q.id,
            orderIndex: pq.orderIndex,
            question: q.question,
            options: q.options,
            subject: q.subject,
            chapter: q.chapter,
            difficulty: q.difficulty,
            marks: pq.marks,
          };
        })
        .filter((q): q is NonNullable<typeof q> => q !== null),
    };
  }

  async getUserPapers(userId: string) {
    return this.prisma.paper.findMany({
      where: { userId },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaperDetails(userId: string, paperId: string) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        questions: true,
        attempts: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!paper || paper.userId !== userId) {
      throw new NotFoundException('Paper not found');
    }

    const qIds = paper.questions.map((pq) => pq.questionId);
    const questions = await this.prisma.questions.findMany({
      where: { id: { in: qIds } },
    });

    const qMap = new Map(questions.map((q) => [q.id, q]));

    return {
      paper,
      questions: paper.questions.map((pq) => ({
        ...pq,
        questionDetails: qMap.get(pq.questionId) || null,
      })),
    };
  }

  async submitPaper(
    userId: string,
    paperId: string,
    dto: {
      answers: Array<{
        questionId: string;
        selectedAnswer?: string;
        timeSpentSec?: number;
      }>;
      totalTimeSpentSec?: number;
    },
  ) {
    const paper = await this.prisma.paper.findUnique({
      where: { id: paperId },
      include: { questions: true },
    });

    if (!paper || paper.userId !== userId) {
      throw new NotFoundException('Paper not found');
    }

    const qIds = paper.questions.map((pq) => pq.questionId);
    const questionObjs = await this.prisma.questions.findMany({
      where: { id: { in: qIds } },
    });
    const qMap = new Map(questionObjs.map((q) => [q.id, q]));

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalScore = 0;
    const maxMarks = paper.totalQuestions * 4;

    const topicStats: Record<string, { correct: number; total: number; subject: string }> = {};

    const answersMap = new Map((dto.answers || []).map((a) => [a.questionId, a]));

    for (const pq of paper.questions) {
      const q = qMap.get(pq.questionId);
      if (!q) continue;

      const userAnsObj = answersMap.get(pq.questionId);
      const selectedAns = userAnsObj?.selectedAnswer;

      const topicKey = q.chapter || q.subject;
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = { correct: 0, total: 0, subject: q.subject };
      }
      topicStats[topicKey].total += 1;

      if (!selectedAns) {
        unattemptedCount += 1;
        continue;
      }

      const cleanUserAns = selectedAns.trim().toLowerCase();
      const cleanCorrectAns = (q.answer || '').trim().toLowerCase();
      const isCorrect =
        cleanUserAns === cleanCorrectAns ||
        cleanUserAns === cleanCorrectAns.replace(/[()]/g, '') ||
        cleanUserAns.endsWith(cleanCorrectAns.replace(/[()]/g, ''));

      if (isCorrect) {
        correctCount += 1;
        totalScore += 4;
        topicStats[topicKey].correct += 1;
      } else {
        incorrectCount += 1;
        totalScore -= 1; // Negative marking in exam mode
      }

      // Record QuestionAttempt in DB
      await this.prisma.questionAttempt.create({
        data: {
          userId,
          questionId: q.id,
          selectedAnswer: selectedAns,
          correctAnswer: q.answer || '',
          isCorrect,
          timeTakenSec: userAnsObj?.timeSpentSec || 30,
          mode: 'PAPER',
          subject: q.subject,
          chapter: q.chapter,
          difficulty: q.difficulty,
        },
      });
    }

    const accuracy = paper.totalQuestions > 0 ? Math.round((correctCount / paper.totalQuestions) * 100) : 0;
    const xpEarned = Math.max(10, totalScore * 5);

    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    for (const [top, stat] of Object.entries(topicStats)) {
      const acc = Math.round((stat.correct / stat.total) * 100);
      if (acc >= 70) {
        strongTopics.push(top);
      } else {
        weakTopics.push(top);
      }
    }

    const attempt = await this.prisma.paperAttempt.create({
      data: {
        paperId,
        userId,
        score: totalScore,
        totalMarks: maxMarks,
        accuracy,
        timeSpentSec: dto.totalTimeSpentSec || 0,
        answersJson: dto.answers as any,
        breakdown: {
          correctCount,
          incorrectCount,
          unattemptedCount,
          strongTopics,
          weakTopics,
        } as any,
      },
    });

    // Update user XP
    await this.prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        xp: xpEarned,
        level: Math.floor(xpEarned / 100) + 1,
        lastActiveDate: new Date(),
      },
      update: {
        xp: { increment: xpEarned },
        lastActiveDate: new Date(),
      },
    });

    return {
      attemptId: attempt.id,
      paperId,
      score: totalScore,
      maxMarks,
      accuracy,
      correctCount,
      incorrectCount,
      unattemptedCount,
      timeSpentSec: dto.totalTimeSpentSec || 0,
      xpEarned,
      strongTopics,
      weakTopics,
      recommendedPracticeTopic: weakTopics.length > 0 ? weakTopics[0] : null,
    };
  }
}
