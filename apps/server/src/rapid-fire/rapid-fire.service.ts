import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class RapidFireService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsService: QuestionsService,
  ) {}

  async startSession(
    userId: string,
    dto: {
      mode?: string;
      subject?: string;
      topic?: string;
      questionCount?: number;
    },
  ) {
    const mode = dto.mode || 'RAPID_FIRE';
    const limit = dto.questionCount && dto.questionCount > 0 ? dto.questionCount : 10;

    let filterSubject = dto.subject;
    let filterTopic = dto.topic;

    const where: any = {
      is_usable: true,
      question_quality: { in: ['high', 'medium'] },
    };

    if (filterSubject && filterSubject !== 'Mixed' && filterSubject !== 'ALL') {
      where.subject = { equals: filterSubject, mode: 'insensitive' };
    }

    if (mode === 'WEAK_TOPICS' || mode === 'ADAPTIVE') {
      const weakTopics = await this.questionsService.getUserWeakTopics(userId);
      if (weakTopics.length > 0) {
        const targetTopics = weakTopics.map((w) => w.topic).filter(Boolean);
        const targetSubjects = Array.from(new Set(weakTopics.map((w) => w.subject).filter(Boolean)));

        where.OR = [
          { chapter: { in: targetTopics } },
          { topics: { hasSome: targetTopics } },
          { subject: { in: targetSubjects } },
        ];
      }
    } else if (filterTopic && filterTopic !== 'Mixed') {
      where.OR = [{ chapter: filterTopic }, { topics: { has: filterTopic } }];
    }

    // Get candidate questions from DB
    const candidates = await this.prisma.questions.findMany({
      where,
      take: limit * 4,
    });

    if (candidates.length === 0) {
      // Fallback: relax topic constraint but ALWAYS preserve subject & usability!
      const fallbackWhere: any = {
        is_usable: true,
        question_quality: { in: ['high', 'medium'] },
      };
      if (filterSubject && filterSubject !== 'Mixed' && filterSubject !== 'ALL') {
        fallbackWhere.subject = { equals: filterSubject, mode: 'insensitive' };
      }
      const fallback = await this.prisma.questions.findMany({
        where: fallbackWhere,
        take: limit,
      });
      if (fallback.length === 0) {
        throw new NotFoundException(`No usable ${filterSubject || ''} questions available in database`);
      }
      candidates.push(...fallback);
    }

    // Shuffle and pick requested limit
    const shuffled = candidates.sort(() => 0.5 - Math.random()).slice(0, limit);

    // Create QuizSession record in DB
    const session = await this.prisma.quizSession.create({
      data: {
        userId,
        mode,
        subject: filterSubject || 'Mixed',
        topic: filterTopic || 'Mixed',
        totalQuestions: shuffled.length,
        status: 'IN_PROGRESS',
        questions: {
          create: shuffled.map((q, idx) => ({
            questionId: q.id,
            orderIndex: idx + 1,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    const questionMap = new Map(shuffled.map((q) => [q.id, q]));

    const returnedQuestions = session.questions
      .map((sq) => {
        const q = questionMap.get(sq.questionId);
        if (!q) return null;
        return {
          sessionQuestionId: sq.id,
          questionId: q.id,
          orderIndex: sq.orderIndex,
          question: q.question,
          options: q.options,
          subject: q.subject,
          chapter: q.chapter,
          topics: q.topics,
          difficulty: q.difficulty,
          exam: q.exam,
          year: q.year,
          question_type: q.question_type || 'single_correct_mcq',
          question_quality: q.question_quality || 'high',
          is_usable: q.is_usable,
          image_url: q.image_url || q.image_path || null,
        };
      })
      .filter((q): q is NonNullable<typeof q> => q !== null);

    return {
      sessionId: session.id,
      mode: session.mode,
      subject: session.subject,
      totalQuestions: session.totalQuestions,
      questions: returnedQuestions,
    };
  }

  async answerQuestion(
    userId: string,
    sessionId: string,
    dto: {
      questionId: string;
      selectedAnswer: string;
      timeTakenSec?: number;
    },
  ) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Quiz session not found');
    }

    if (session.status === 'COMPLETED') {
      throw new BadRequestException('Quiz session is already completed');
    }

    const questionObj = await this.prisma.questions.findUnique({
      where: { id: dto.questionId },
    });

    if (!questionObj) {
      throw new NotFoundException('Question not found');
    }

    const cleanUserAns = (dto.selectedAnswer || '').trim().toLowerCase();
    const cleanCorrectAns = (questionObj.answer || '').trim().toLowerCase();
    const qType = questionObj.question_type || 'single_correct_mcq';

    let isCorrect = false;

    if (qType === 'numerical' || qType === 'integer_numerical') {
      const userNum = parseFloat(cleanUserAns.replace(/,/g, ''));
      const correctNum = parseFloat(cleanCorrectAns.replace(/,/g, ''));
      if (!isNaN(userNum) && !isNaN(correctNum)) {
        isCorrect = Math.abs(userNum - correctNum) <= 0.05;
      } else {
        isCorrect = cleanUserAns === cleanCorrectAns;
      }
    } else if (qType === 'multiple_correct_mcq') {
      const userKeys = cleanUserAns.split(/[,&\s]+/).map((k) => k.trim()).filter(Boolean).sort().join(',');
      const correctKeys = cleanCorrectAns.split(/[,&\s]+/).map((k) => k.trim()).filter(Boolean).sort().join(',');
      isCorrect = userKeys === correctKeys || cleanUserAns === cleanCorrectAns;
    } else {
      isCorrect =
        cleanUserAns === cleanCorrectAns ||
        cleanUserAns === cleanCorrectAns.replace(/[()]/g, '') ||
        cleanUserAns.endsWith(cleanCorrectAns.replace(/[()]/g, ''));
    }

    const timeTaken = dto.timeTakenSec || 15;

    // Update QuizSessionQuestion in DB
    const sessionQ = session.questions.find((q) => q.questionId === dto.questionId);
    if (sessionQ) {
      await this.prisma.quizSessionQuestion.update({
        where: { id: sessionQ.id },
        data: {
          userAnswer: dto.selectedAnswer,
          isCorrect,
          timeTakenSec: timeTaken,
        },
      });
    }

    // Record QuestionAttempt in DB for performance analytics & weak-topic engine!
    await this.prisma.questionAttempt.create({
      data: {
        userId,
        questionId: questionObj.id,
        selectedAnswer: dto.selectedAnswer,
        correctAnswer: questionObj.answer || '',
        isCorrect,
        timeTakenSec: timeTaken,
        mode: session.mode,
        subject: questionObj.subject,
        chapter: questionObj.chapter,
        difficulty: questionObj.difficulty,
      },
    });

    // Update session score & streak
    let updatedScore = session.score;
    let newStreak = session.streakMax;

    if (isCorrect) {
      updatedScore += 1;
      newStreak += 1;
    } else {
      newStreak = 0;
    }

    const baseXP = isCorrect ? 10 : 2;
    const streakBonus = isCorrect ? Math.min(newStreak * 5, 25) : 0;
    const totalXPEarned = baseXP + streakBonus;

    await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        score: updatedScore,
        streakMax: Math.max(session.streakMax, newStreak),
        xpEarned: session.xpEarned + totalXPEarned,
      },
    });

    // Update User Gamification Profile in DB
    const gamification = await this.prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        xp: totalXPEarned,
        level: Math.floor(totalXPEarned / 100) + 1,
        currentStreak: isCorrect ? 1 : 0,
        longestStreak: isCorrect ? 1 : 0,
        lastActiveDate: new Date(),
      },
      update: {
        xp: { increment: totalXPEarned },
        currentStreak: isCorrect ? { increment: 1 } : 0,
        lastActiveDate: new Date(),
      },
    });

    // Recalculate level
    const newLevel = Math.floor(gamification.xp / 100) + 1;
    if (newLevel !== gamification.level) {
      await this.prisma.gamificationProfile.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    return {
      questionId: questionObj.id,
      selectedAnswer: dto.selectedAnswer,
      isCorrect,
      correctAnswer: questionObj.answer,
      solution: questionObj.solution,
      xpEarned: totalXPEarned,
      currentStreak: newStreak,
      totalXP: gamification.xp + totalXPEarned,
      level: newLevel,
    };
  }

  async finishSession(userId: string, sessionId: string) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Quiz session not found');
    }

    const completionBonusXP = session.score > 0 ? 50 : 10;

    const updatedSession = await this.prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        xpEarned: { increment: completionBonusXP },
      },
    });

    // Update user total XP with bonus
    await this.prisma.gamificationProfile.update({
      where: { userId },
      data: {
        xp: { increment: completionBonusXP },
      },
    });

    const accuracy =
      session.totalQuestions > 0
        ? Math.round((session.score / session.totalQuestions) * 100)
        : 0;

    return {
      sessionId: updatedSession.id,
      status: 'COMPLETED',
      score: updatedSession.score,
      totalQuestions: updatedSession.totalQuestions,
      accuracy,
      xpEarned: updatedSession.xpEarned,
      streakMax: updatedSession.streakMax,
    };
  }

  async getSessionDetails(userId: string, sessionId: string) {
    const session = await this.prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Quiz session not found');
    }

    const qIds = session.questions.map((q) => q.questionId);
    const questions = await this.prisma.questions.findMany({
      where: { id: { in: qIds } },
    });

    const qMap = new Map(questions.map((q) => [q.id, q]));

    return {
      session,
      questions: session.questions.map((sq) => ({
        ...sq,
        questionDetails: qMap.get(sq.questionId) || null,
      })),
    };
  }

  async getUserWeakTopicsAnalytics(userId: string) {
    return this.questionsService.getUserWeakTopics(userId);
  }
}
