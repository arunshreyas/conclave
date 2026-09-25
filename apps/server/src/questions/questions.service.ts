import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubjectsAndMetadata() {
    const subjectsRaw = await this.prisma.questions.groupBy({
      by: ['subject'],
      _count: { id: true },
    });

    const chaptersRaw = await this.prisma.questions.groupBy({
      by: ['subject', 'chapter'],
      where: { chapter: { not: null } },
      _count: { id: true },
    });

    const yearsRaw = await this.prisma.questions.groupBy({
      by: ['year'],
      _count: { id: true },
    });

    return {
      subjects: subjectsRaw.map((s) => ({ name: s.subject, count: s._count.id })),
      chapters: chaptersRaw.map((c) => ({
        subject: c.subject,
        chapter: c.chapter,
        count: c._count.id,
      })),
      years: yearsRaw.map((y) => ({ year: y.year, count: y._count.id })).sort((a, b) => b.year - a.year),
    };
  }

  async getQuestionById(id: string) {
    const q = await this.prisma.questions.findUnique({
      where: { id },
    });
    if (!q) {
      throw new NotFoundException('Question not found');
    }
    return q;
  }

  async getQuestions(filters: {
    subject?: string;
    chapter?: string;
    topic?: string;
    difficulty?: string;
    year?: number;
    limit?: number;
    excludeIds?: string[];
  }) {
    const where: any = {
      is_usable: true,
      question_quality: { in: ['high', 'medium'] },
    };
    if (filters.subject && filters.subject !== 'Mixed' && filters.subject !== 'ALL') where.subject = filters.subject;
    if (filters.chapter && filters.chapter !== 'Mixed') where.chapter = filters.chapter;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.year) where.year = filters.year;
    if (filters.excludeIds && filters.excludeIds.length > 0) {
      where.id = { notIn: filters.excludeIds };
    }

    const take = filters.limit || 20;

    const questions = await this.prisma.questions.findMany({
      where,
      take,
      orderBy: { created_at: 'desc' },
    });

    return questions;
  }

  async getQuestionsForReview(limit = 30) {
    return this.prisma.questions.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
    });
  }

  async updateQuestionReview(id: string, data: { is_usable?: boolean; question_quality?: string; question_type?: string }) {
    return this.prisma.questions.update({
      where: { id },
      data,
    });
  }

  async saveQuestion(userId: string, questionId: string, notes?: string) {
    const existing = await this.prisma.savedQuestion.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.savedQuestion.create({
      data: {
        userId,
        questionId,
        notes,
      },
    });
  }

  async unsaveQuestion(userId: string, questionId: string) {
    return this.prisma.savedQuestion.deleteMany({
      where: { userId, questionId },
    });
  }

  async getSavedQuestions(userId: string) {
    const saved = await this.prisma.savedQuestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const questionIds = saved.map((s) => s.questionId);
    const questions = await this.prisma.questions.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    return saved.map((s) => ({
      savedId: s.id,
      notes: s.notes,
      savedAt: s.createdAt,
      question: questionMap.get(s.questionId) || null,
    }));
  }

  async getUserWeakTopics(userId: string): Promise<Array<{ subject: string; topic: string; accuracy: number; totalAttempts: number }>> {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
    });

    if (attempts.length === 0) {
      return [];
    }

    const topicStats: Record<string, { subject: string; topic: string; correct: number; total: number }> = {};

    for (const a of attempts) {
      const key = `${a.subject}:::${a.chapter || a.topic || 'General'}`;
      if (!topicStats[key]) {
        topicStats[key] = {
          subject: a.subject,
          topic: a.chapter || a.topic || 'General',
          correct: 0,
          total: 0,
        };
      }
      topicStats[key].total += 1;
      if (a.isCorrect) {
        topicStats[key].correct += 1;
      }
    }

    const weakTopics = Object.values(topicStats)
      .map((stat) => ({
        subject: stat.subject,
        topic: stat.topic,
        accuracy: Math.round((stat.correct / stat.total) * 100),
        totalAttempts: stat.total,
      }))
      .filter((stat) => stat.accuracy < 65 || stat.totalAttempts < 3)
      .sort((a, b) => a.accuracy - b.accuracy);

    return weakTopics;
  }
}
