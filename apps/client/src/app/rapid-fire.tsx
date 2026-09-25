import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { api } from '@/services/api';
import { speechUtils } from '@/utils/speech';
import { formatMathText, normalizeOptions } from '@/utils/textFormatter';

export default function RapidFireScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; subject?: string; topic?: string }>();

  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active question state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<any | null>(null);
  const [answering, setAnswering] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Score & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Session summary
  const [isFinished, setIsFinished] = useState(false);
  const [finishSummary, setFinishSummary] = useState<any | null>(null);

  // Setup options if launched without active session
  const [mode, setMode] = useState(params.mode || 'RAPID_FIRE');
  const [selectedSubject, setSelectedSubject] = useState(params.subject || 'Mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  const handleStartGame = async () => {
    try {
      setLoading(true);
      const data = await api.startRapidFire({
        mode,
        subject: selectedSubject,
        questionCount,
      });

      setSessionId(data.sessionId);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setTotalXp(0);
      setSeconds(0);
      setIsFinished(false);
      setGameStarted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start Rapid Fire session');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = async (optionKey: string) => {
    if (selectedAnswer || answering || !sessionId || !currentQ) return;

    setSelectedAnswer(optionKey);
    setAnswering(true);

    try {
      const res = await api.answerRapidFireQuestion(sessionId, {
        questionId: currentQ.questionId,
        selectedAnswer: optionKey,
        timeTakenSec: seconds,
      });

      setAnswerFeedback(res);

      if (res.isCorrect) {
        setScore((prev) => prev + 1);
        setStreak(res.currentStreak || streak + 1);
        setTotalXp((prev) => prev + (res.xpEarned || 10));
      } else {
        setStreak(0);
      }
    } catch (err: any) {
      console.warn('Answer submit error:', err);
    } finally {
      setAnswering(false);
    }
  };

  const handleNextQuestion = async () => {
    speechUtils.stop();
    setSelectedAnswer(null);
    setAnswerFeedback(null);
    setIsSaved(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish Session
      try {
        setLoading(true);
        if (sessionId) {
          const summary = await api.finishRapidFireSession(sessionId);
          setFinishSummary(summary);
          setIsFinished(true);
        }
      } catch (err: any) {
        console.warn('Finish session error:', err);
        setIsFinished(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSpeakQuestion = () => {
    if (currentQ) {
      const textToRead = `${formatMathText(currentQ.question)}.`;
      speechUtils.speak(textToRead);
    }
  };

  const handleSaveQuestion = async () => {
    if (!currentQ) return;
    try {
      if (isSaved) {
        await api.unsaveQuestion(currentQ.questionId);
        setIsSaved(false);
      } else {
        await api.saveQuestion(currentQ.questionId);
        setIsSaved(true);
      }
    } catch (e) {
      console.warn('Save question failed:', e);
    }
  };

  // 1. Pre-game setup view
  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>RAPID FIRE // GAME MODE</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.setupHeading}>CHOOSE GAME MODE</Text>
          <View style={styles.modeRow}>
            {[
              { id: 'RAPID_FIRE', label: 'SPEED DRILL' },
              { id: 'WEAK_TOPICS', label: 'WEAK TOPICS ⚠️' },
              { id: 'MIXED', label: 'MIXED PYQ' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeCard, mode === m.id && styles.modeCardActive]}
                onPress={() => setMode(m.id)}
              >
                <Text style={[styles.modeText, mode === m.id && styles.modeTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.setupHeading}>SUBJECT FILTER</Text>
          <View style={styles.subjectRow}>
            {['Mixed', 'Physics', 'Chemistry', 'Mathematics'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.subjectBtn, selectedSubject === s && styles.subjectBtnActive]}
                onPress={() => setSelectedSubject(s)}
              >
                <Text style={[styles.subjectBtnText, selectedSubject === s && styles.subjectBtnTextActive]}>
                  {s.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.setupHeading}>NUMBER OF QUESTIONS</Text>
          <View style={styles.countRow}>
            {[10, 20, 30].map((cnt) => (
              <TouchableOpacity
                key={cnt}
                style={[styles.countBtn, questionCount === cnt && styles.countBtnActive]}
                onPress={() => setQuestionCount(cnt)}
              >
                <Text style={[styles.countBtnText, questionCount === cnt && styles.countBtnTextActive]}>
                  {cnt} Qs
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.startDock}>
            <BrutalistButton title="🔥 START RAPID FIRE DRILL" variant="primary" onPress={handleStartGame} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#06B6D4" />
        <Text style={styles.loadingText}>PREPARING QUESTIONS FROM SUPABASE PYQ DATABASE...</Text>
      </SafeAreaView>
    );
  }

  // 3. Final Score & Summary View
  if (isFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.finishedCard}>
            <Text style={styles.finishedTitle}>DRILL COMPLETE! 🔥</Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>SCORE</Text>
                <Text style={styles.scoreNum}>
                  {finishSummary?.score || score} / {questions.length}
                </Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>ACCURACY</Text>
                <Text style={[styles.scoreNum, { color: '#06B6D4' }]}>
                  {finishSummary?.accuracy || Math.round((score / questions.length) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.xpCard}>
              <Text style={styles.xpLabel}>TOTAL XP EARNED</Text>
              <Text style={styles.xpNum}>+{finishSummary?.xpEarned || totalXp} XP</Text>
            </View>

            <View style={styles.btnStack}>
              <BrutalistButton
                title="PLAY AGAIN"
                variant="primary"
                onPress={() => {
                  setGameStarted(false);
                }}
              />
              <BrutalistButton title="RETURN TO DASHBOARD" variant="secondary" onPress={() => router.replace('/(tabs)')} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 4. Active Question View
  const optionsList = normalizeOptions(currentQ?.options);

  return (
    <SafeAreaView style={styles.container}>
      {/* Game Header Bar */}
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.quitBtn}>✕ QUIT</Text>
        </TouchableOpacity>

        <View style={styles.headerStats}>
          <Text style={styles.streakBadge}>🔥 {streak} STREAK</Text>
          <Text style={styles.xpBadge}>⭐ +{totalXp} XP</Text>
        </View>
      </View>

      {/* Progress Line */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.gameContent}>
        {/* Question Counter & Meta */}
        <View style={styles.qMetaRow}>
          <Text style={styles.qCounterText}>
            QUESTION {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSpeakQuestion}>
              <Text style={styles.iconBtnText}>🔊 VOICE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSaveQuestion}>
              <Text style={styles.iconBtnText}>{isSaved ? '🔖 SAVED' : '🔖 SAVE'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Question Text Box */}
        <BrutalistCard highlight>
          <Text style={styles.qSubjectTag}>
            {currentQ?.subject} {currentQ?.chapter ? `// ${currentQ.chapter}` : ''}
          </Text>
          <Text style={styles.qText}>{formatMathText(currentQ?.question)}</Text>
        </BrutalistCard>

        {/* Options Grid */}
        <View style={styles.optionsContainer}>
          {optionsList.map((opt) => {
            const isSelected = selectedAnswer === opt.key;
            const isOptionCorrect = answerFeedback?.correctAnswer && (
              answerFeedback.correctAnswer.toLowerCase().includes(opt.key.toLowerCase()) ||
              opt.key.toLowerCase().includes(answerFeedback.correctAnswer.toLowerCase())
            );

            const btnStyle = [
              styles.optionBtn,
              selectedAnswer && isSelected && answerFeedback?.isCorrect && styles.optionCorrect,
              selectedAnswer && isSelected && !answerFeedback?.isCorrect && styles.optionIncorrect,
              selectedAnswer && !isSelected && isOptionCorrect && styles.optionCorrect,
            ].filter(Boolean);

            const textStyle = [
              styles.optionText,
              selectedAnswer && isSelected && answerFeedback?.isCorrect && styles.optionTextCorrect,
              selectedAnswer && isSelected && !answerFeedback?.isCorrect && styles.optionTextIncorrect,
              selectedAnswer && !isSelected && isOptionCorrect && styles.optionTextCorrect,
            ].filter(Boolean);

            return (
              <TouchableOpacity
                key={opt.key}
                style={btnStyle as any}
                disabled={!!selectedAnswer || answering}
                onPress={() => handleSelectOption(opt.key)}
              >
                <View style={styles.optBadge}>
                  <Text style={styles.optKey}>{opt.key}</Text>
                </View>
                <Text style={textStyle as any}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Immediate Feedback & Solution Box */}
        {answerFeedback && (
          <View style={[styles.feedbackBox, answerFeedback.isCorrect ? styles.fbGreen : styles.fbRed]}>
            <View style={styles.feedbackHeader}>
              <Text style={[styles.feedbackTitle, answerFeedback.isCorrect ? styles.txtGreen : styles.txtRed]}>
                {answerFeedback.isCorrect ? '✓ CORRECT! +10 XP' : '✗ INCORRECT'}
              </Text>
            </View>

            {answerFeedback.solution && (
              <Text style={styles.solutionText}>Solution: {formatMathText(answerFeedback.solution)}</Text>
            )}

            <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuestion}>
              <Text style={styles.nextBtnText}>
                {currentIndex + 1 === questions.length ? 'FINISH DRILL →' : 'NEXT QUESTION →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  topBar: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
  },
  backBtn: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '700',
  },
  title: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#F3F4F6',
    fontWeight: '800',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  setupHeading: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#06B6D4',
    letterSpacing: 1.2,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    alignItems: 'center',
  },
  modeCardActive: {
    backgroundColor: '#06B6D4',
    borderColor: '#22D3EE',
  },
  modeText: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#F3F4F6',
    fontWeight: '700',
  },
  modeTextActive: {
    color: '#0B0F19',
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
  },
  subjectBtnActive: {
    backgroundColor: '#F3F4F6',
  },
  subjectBtnText: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  subjectBtnTextActive: {
    color: '#0B0F19',
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    alignItems: 'center',
  },
  countBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#FBBF24',
  },
  countBtnText: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#F3F4F6',
    fontWeight: '700',
  },
  countBtnTextActive: {
    color: '#0B0F19',
  },
  startDock: {
    marginTop: 28,
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#06B6D4',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '700',
  },
  gameHeader: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
  },
  quitBtn: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  streakBadge: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '800',
  },
  xpBadge: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1F2937',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06B6D4',
  },
  gameContent: {
    padding: 16,
    paddingBottom: 40,
  },
  qMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qCounterText: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  iconBtnText: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#06B6D4',
    fontWeight: '700',
  },
  qSubjectTag: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#06B6D4',
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  qText: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '700',
    color: '#F3F4F6',
    lineHeight: 26,
  },
  optionsContainer: {
    marginTop: 16,
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
  },
  optionCorrect: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  optionIncorrect: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  optBadge: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#1F2937',
  },
  optKey: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#06B6D4',
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontFamily: 'System',
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  optionTextCorrect: {
    color: '#A7F3D0',
    fontWeight: '700',
  },
  optionTextIncorrect: {
    color: '#FECACA',
    fontWeight: '700',
  },
  feedbackBox: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  fbGreen: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  fbRed: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  feedbackHeader: {
    marginBottom: 6,
  },
  feedbackTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '900',
  },
  txtGreen: {
    color: '#34D399',
  },
  txtRed: {
    color: '#FCA5A5',
  },
  solutionText: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#F3F4F6',
    marginVertical: 8,
    lineHeight: 20,
  },
  nextBtn: {
    height: 44,
    backgroundColor: '#06B6D4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  nextBtnText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#0B0F19',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  finishedCard: {
    padding: 24,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 16,
  },
  finishedTitle: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scoreBox: {
    flex: 1,
    padding: 14,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  scoreNum: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '900',
    color: '#F3F4F6',
    marginTop: 4,
  },
  xpCard: {
    padding: 16,
    backgroundColor: '#451A03',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  xpLabel: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#FBBF24',
    fontWeight: '800',
  },
  xpNum: {
    fontFamily: 'System',
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  btnStack: {
    gap: 10,
  },
});
