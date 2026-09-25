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

export default function RapidFireScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; subject?: string; topic?: string }>();

  const [loading, setLoading] = useState(true);
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
      const textToRead = `${currentQ.question}. ${
        currentQ.options ? Object.entries(currentQ.options).map(([k, v]) => `Option ${k}: ${v}`).join('. ') : ''
      }`;
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
          <Text style={styles.title}>RAPID FIRE // SETUP</Text>
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
        <ActivityIndicator size="large" color="#f2bf4b" />
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
                <Text style={[styles.scoreNum, { color: '#f2bf4b' }]}>
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
  const optionsObj = currentQ?.options || {};
  const optionsList = Array.isArray(optionsObj)
    ? optionsObj.map((opt, i) => ({ key: String.fromCharCode(65 + i), text: String(opt) }))
    : Object.entries(optionsObj).map(([k, v]) => ({ key: k.toUpperCase(), text: String(v) }));

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
          <Text style={styles.qText}>{currentQ?.question}</Text>
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
                style={btnStyle}
                disabled={!!selectedAnswer || answering}
                onPress={() => handleSelectOption(opt.key)}
              >
                <View style={styles.optBadge}>
                  <Text style={styles.optKey}>{opt.key}</Text>
                </View>
                <Text style={textStyle}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Immediate Feedback & Solution Box */}
        {answerFeedback && (
          <View style={styles.feedbackBox}>
            <View style={styles.feedbackHeader}>
              <Text style={[styles.feedbackTitle, answerFeedback.isCorrect ? styles.txtGreen : styles.txtRed]}>
                {answerFeedback.isCorrect ? '✓ CORRECT! +10 XP' : '✗ INCORRECT'}
              </Text>
            </View>

            {answerFeedback.solution && (
              <Text style={styles.solutionText}>Solution: {answerFeedback.solution}</Text>
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
    backgroundColor: '#310004',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  topBar: {
    height: 48,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#310004',
  },
  backBtn: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffdad8',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  setupHeading: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.5,
    fontWeight: '700',
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
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  modeCardActive: {
    backgroundColor: '#f2bf4b',
    borderColor: '#ffffff',
  },
  modeText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffdad8',
    fontWeight: '700',
  },
  modeTextActive: {
    color: '#130f16',
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  subjectBtnActive: {
    backgroundColor: '#ffffff',
  },
  subjectBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  subjectBtnTextActive: {
    color: '#130f16',
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  countBtnActive: {
    backgroundColor: '#f2bf4b',
  },
  countBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#ffdad8',
    fontWeight: '700',
  },
  countBtnTextActive: {
    color: '#130f16',
  },
  startDock: {
    marginTop: 28,
  },
  loadingText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    marginTop: 16,
    textAlign: 'center',
  },
  gameHeader: {
    height: 48,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#270003',
  },
  quitBtn: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffb4ab',
    fontWeight: '700',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  streakBadge: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '800',
  },
  xpBadge: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#270003',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f2bf4b',
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
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
  },
  iconBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  qSubjectTag: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    marginBottom: 6,
  },
  qText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffdad8',
    lineHeight: 24,
  },
  optionsContainer: {
    marginTop: 16,
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  optionCorrect: {
    backgroundColor: '#1b371b',
    borderColor: '#4CAF50',
  },
  optionIncorrect: {
    backgroundColor: '#480009',
    borderColor: '#F44336',
  },
  optBadge: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#4b463b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#310004',
  },
  optKey: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#f2bf4b',
    fontWeight: '800',
  },
  optionText: {
    flex: 1,
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#ffdad8',
    lineHeight: 18,
  },
  optionTextCorrect: {
    color: '#81C784',
    fontWeight: '700',
  },
  optionTextIncorrect: {
    color: '#E57373',
    fontWeight: '700',
  },
  feedbackBox: {
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
  },
  feedbackHeader: {
    marginBottom: 6,
  },
  feedbackTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  txtGreen: {
    color: '#4CAF50',
  },
  txtRed: {
    color: '#F44336',
  },
  solutionText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#cdc6b7',
    marginVertical: 8,
    lineHeight: 18,
  },
  nextBtn: {
    height: 42,
    backgroundColor: '#f2bf4b',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  nextBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#130f16',
    fontWeight: '900',
    letterSpacing: 1,
  },
  finishedCard: {
    padding: 20,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  finishedTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 24,
    fontWeight: '900',
    color: '#f2bf4b',
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
    backgroundColor: '#310004',
    borderWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
  },
  scoreNum: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
  },
  xpCard: {
    padding: 14,
    backgroundColor: '#382b00',
    borderWidth: 1,
    borderColor: '#f2bf4b',
    alignItems: 'center',
    marginBottom: 20,
  },
  xpLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
  },
  xpNum: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  btnStack: {
    gap: 10,
  },
});
