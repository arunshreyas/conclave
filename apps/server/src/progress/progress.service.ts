import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsService: QuestionsService,
  ) {}

  async getDashboard(userId: string) {
    // 1. Fetch user & profile
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    // 2. Fetch gamification
    let gamification = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
    });
    if (!gamification) {
      gamification = await this.prisma.gamificationProfile.create({
        data: { userId, xp: 0, level: 1, currentStreak: 0, longestStreak: 0 },
      });
    }

    // 3. Fetch attempts
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
    });

    const totalQuestionsSolved = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const overallAccuracy =
      totalQuestionsSolved > 0
        ? Math.round((correctAttempts / totalQuestionsSolved) * 100)
        : 0;

    // 4. Subject performance breakdown
    const subjectStats: Record<string, { correct: number; total: number }> = {
      Physics: { correct: 0, total: 0 },
      Chemistry: { correct: 0, total: 0 },
      Mathematics: { correct: 0, total: 0 },
    };

    for (const a of attempts) {
      const subj = a.subject || 'Physics';
      if (!subjectStats[subj]) {
        subjectStats[subj] = { correct: 0, total: 0 };
      }
      subjectStats[subj].total += 1;
      if (a.isCorrect) {
        subjectStats[subj].correct += 1;
      }
    }

    const subjectPerformance = Object.entries(subjectStats).map(([subj, stat]) => ({
      subject: subj,
      accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      questionsSolved: stat.total,
    }));

    // 5. Weak topics
    const weakTopics = await this.questionsService.getUserWeakTopics(userId);

    // 6. Recent sessions
    const recentSessions = await this.prisma.quizSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 7. Recommendation
    const topWeakTopic = weakTopics.length > 0 ? weakTopics[0] : null;
    const recommendation = topWeakTopic
      ? {
          title: `Improve ${topWeakTopic.topic}`,
          description: `You currently have ${topWeakTopic.accuracy}% accuracy in ${topWeakTopic.topic}. Complete a 10-question Rapid Fire session to boost your mastery!`,
          subject: topWeakTopic.subject,
          topic: topWeakTopic.topic,
        }
      : {
          title: 'Daily Practice Session',
          description: 'Keep your streak alive! Complete a mixed 10-question practice set today.',
          subject: 'Mixed',
          topic: 'Mixed',
        };

    return {
      userName: profile?.name || profile?.userName || 'Student',
      school: profile?.school || 'School',
      grade: profile?.grade || 'Class 12',
      stream: profile?.stream || 'JEE Main',
      xp: gamification.xp,
      level: gamification.level,
      streak: gamification.currentStreak,
      longestStreak: gamification.longestStreak,
      totalQuestionsSolved,
      overallAccuracy,
      subjectPerformance,
      weakTopics: weakTopics.slice(0, 5),
      recentSessions,
      recommendation,
    };
  }

  async getAnalytics(userId: string) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const topicStats: Record<string, { subject: string; chapter: string; correct: number; total: number; avgTimeSec: number }> = {};

    for (const a of attempts) {
      const key = `${a.subject}:::${a.chapter || 'General'}`;
      if (!topicStats[key]) {
        topicStats[key] = {
          subject: a.subject,
          chapter: a.chapter || 'General',
          correct: 0,
          total: 0,
          avgTimeSec: 0,
        };
      }
      topicStats[key].total += 1;
      topicStats[key].avgTimeSec += a.timeTakenSec;
      if (a.isCorrect) {
        topicStats[key].correct += 1;
      }
    }

    const topicBreakdown = Object.values(topicStats).map((t) => ({
      subject: t.subject,
      chapter: t.chapter,
      accuracy: Math.round((t.correct / t.total) * 100),
      totalAttempts: t.total,
      avgTimeSec: Math.round(t.avgTimeSec / t.total),
    }));

    return {
      totalAttempts: attempts.length,
      topicBreakdown,
    };
  }

  async getAttempts(userId: string, limit = 50) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const qIds = attempts.map((a) => a.questionId);
    const questions = await this.prisma.questions.findMany({
      where: { id: { in: qIds } },
    });
    const qMap = new Map(questions.map((q) => [q.id, q]));

    return attempts.map((a) => ({
      ...a,
      question: qMap.get(a.questionId) || null,
    }));
  }
}
