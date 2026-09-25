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
import {
  BrutalistButton,
  BrutalistBadge,
  BrutalistCard,
  XPLevelBar,
  getRankTitle,
} from '@/components/brutalist-ui';
import { api } from '@/services/api';
import { speechUtils } from '@/utils/speech';
import { formatMathText, normalizeOptions } from '@/utils/textFormatter';
import { sfx } from '@/utils/sound';

export default function RapidFireScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; subject?: string; topic?: string }>();

  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gamification & Weak Topics
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [userXp, setUserXp] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [levelUpPopup, setLevelUpPopup] = useState<number | null>(null);

  // Active question state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<any | null>(null);
  const [answering, setAnswering] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Score & Streak
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionXpEarned, setSessionXpEarned] = useState(0);
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
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [dash, weak] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getWeakTopicsAnalytics().catch(() => []),
      ]);

      if (dash?.gamification) {
        setUserXp(dash.gamification.xp || 0);
        setUserLevel(dash.gamification.level || 1);
        setUserProfile(dash.gamification);
      }
      if (Array.isArray(weak)) {
        setWeakTopics(weak);
      }
    } catch (e) {
      console.warn('Failed to load user setup analytics:', e);
    }
  };

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
      setSessionXpEarned(0);
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
        const newStreak = res.currentStreak || streak + 1;
        setStreak(newStreak);

        const xpGained = res.xpEarned || 10;
        setSessionXpEarned((prev) => prev + xpGained);
        setUserXp(res.totalXP || userXp + xpGained);

        // Sound triggers
        if (newStreak >= 3) {
          sfx.playStreak();
        } else {
          sfx.playCorrect();
        }

        // Level Up Trigger
        if (res.level && res.level > userLevel) {
          setUserLevel(res.level);
          setLevelUpPopup(res.level);
          sfx.playLevelUp();
        }
      } else {
        setStreak(0);
        sfx.playIncorrect();
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
          sfx.playLevelUp();
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
          <Text style={styles.title}>RAPID FIRE // DRILL ENGINE</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* XP & Level Status Bar */}
          <XPLevelBar xp={userXp} level={userLevel} style={{ marginBottom: 12 }} />

          {/* Weak Topics Target Indicator */}
          {weakTopics.length > 0 && (
            <BrutalistCard highlight style={styles.weakCard}>
              <View style={styles.weakHeader}>
                <Text style={styles.weakBadge}>⚠️ ADAPTIVE WEAKNESS TARGET</Text>
                <BrutalistBadge label={`${weakTopics.length} TOPICS`} variant="crimson" />
              </View>
              <Text style={styles.weakSub}>
                Questions will be dynamically weighted towards your lowest accuracy chapters:
              </Text>
              <View style={styles.weakTopicList}>
                {weakTopics.slice(0, 3).map((w, i) => (
                  <View key={i} style={styles.weakTopicItem}>
                    <Text style={styles.weakTopicName}>• {w.topic || w.subject}</Text>
                    <Text style={styles.weakTopicAcc}>{w.accuracy}% ACC</Text>
                  </View>
                ))}
              </View>
            </BrutalistCard>
          )}

          <Text style={styles.setupHeading}>CHOOSE DRILL MODE</Text>
          <View style={styles.modeRow}>
            {[
              { id: 'RAPID_FIRE', label: '⚡ SPEED DRILL' },
              { id: 'WEAK_TOPICS', label: '🎯 WEAK TOPICS' },
              { id: 'MIXED', label: '📚 MIXED PYQ' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeCard, mode === m.id && styles.modeCardActive]}
                onPress={() => setMode(m.id)}
              >
                <Text style={[styles.modeText, mode === m.id && styles.modeTextActive]}>
                  {m.label}
                </Text>
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
                <Text
                  style={[
                    styles.subjectBtnText,
                    selectedSubject === s && styles.subjectBtnTextActive,
                  ]}
                >
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
                <Text
                  style={[
                    styles.countBtnText,
                    questionCount === cnt && styles.countBtnTextActive,
                  ]}
                >
                  {cnt} Qs
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.startDock}>
            <BrutalistButton
              title="🔥 START ADAPTIVE DRILL"
              variant="primary"
              onPress={handleStartGame}
            />
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
        <Text style={styles.loadingText}>
          SELECTING ADAPTIVE QUESTION SET FROM JEE DATABASE...
        </Text>
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

            <XPLevelBar xp={userXp} level={userLevel} style={{ marginBottom: 16 }} />

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
              <Text style={styles.xpLabel}>TOTAL XP EARNED THIS SESSION</Text>
              <Text style={styles.xpNum}>+{finishSummary?.xpEarned || sessionXpEarned} XP</Text>
            </View>

            <View style={styles.btnStack}>
              <BrutalistButton
                title="PLAY AGAIN"
                variant="primary"
                onPress={() => {
                  setGameStarted(false);
                }}
              />
              <BrutalistButton
                title="RETURN TO DASHBOARD"
                variant="secondary"
                onPress={() => router.replace('/(tabs)')}
              />
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
          {streak > 0 && <Text style={styles.streakBadge}>🔥 {streak} STREAK</Text>}
          <BrutalistBadge label={`⭐ +${sessionXpEarned} XP`} variant="gold" />
          <BrutalistBadge label={`LVL ${userLevel}`} variant="code" />
        </View>
      </View>

      {/* Level Up Banner Popup */}
      {levelUpPopup && (
        <TouchableOpacity
          style={styles.levelUpBanner}
          onPress={() => setLevelUpPopup(null)}
          activeOpacity={0.9}
        >
          <Text style={styles.levelUpTitle}>🎉 LEVEL UP! YOU REACHED LEVEL {levelUpPopup}!</Text>
          <Text style={styles.levelUpSub}>RANK: {getRankTitle(levelUpPopup)} • +50 BONUS XP</Text>
        </TouchableOpacity>
      )}

      {/* Progress Line */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.gameContent}>
        {/* Question Counter & Meta */}
        <View style={styles.qMetaRow}>
          <Text style={styles.qCounterText}>
            QUESTION {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSpeakQuestion}>
              <Text style={styles.iconBtnText}>🔊 READ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSaveQuestion}>
              <Text style={styles.iconBtnText}>{isSaved ? '🔖 SAVED' : '🔖 SAVE'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Question Text Box */}
        <BrutalistCard highlight style={styles.questionCard}>
          <Text style={styles.qSubjectTag}>
            {currentQ?.subject} {currentQ?.chapter ? `// ${currentQ.chapter}` : ''}
          </Text>
          <Text style={styles.qText}>{formatMathText(currentQ?.question)}</Text>
        </BrutalistCard>

        {/* Options Grid */}
        <View style={styles.optionsContainer}>
          {optionsList.map((opt) => {
            const isSelected = selectedAnswer === opt.key;
            const isOptionCorrect =
              answerFeedback?.correctAnswer &&
              (answerFeedback.correctAnswer.toLowerCase().includes(opt.key.toLowerCase()) ||
                opt.key.toLowerCase().includes(answerFeedback.correctAnswer.toLowerCase()));

            const isAnswered = !!selectedAnswer;

            let btnStyle = [styles.optionBtn];
            let badgeStyle = [styles.optBadge];
            let keyStyle = [styles.optKey];
            let textStyle = [styles.optionText];

            if (isAnswered) {
              if (isSelected && answerFeedback?.isCorrect) {
                btnStyle.push(styles.optionCorrect as any);
                badgeStyle.push(styles.optBadgeCorrect as any);
                keyStyle.push(styles.optKeyCorrect as any);
                textStyle.push(styles.optionTextCorrect as any);
              } else if (isSelected && !answerFeedback?.isCorrect) {
                btnStyle.push(styles.optionIncorrect as any);
                badgeStyle.push(styles.optBadgeIncorrect as any);
                keyStyle.push(styles.optKeyIncorrect as any);
                textStyle.push(styles.optionTextIncorrect as any);
              } else if (!isSelected && isOptionCorrect) {
                btnStyle.push(styles.optionCorrect as any);
                badgeStyle.push(styles.optBadgeCorrect as any);
                keyStyle.push(styles.optKeyCorrect as any);
                textStyle.push(styles.optionTextCorrect as any);
              }
            } else if (isSelected) {
              btnStyle.push(styles.optionSelected as any);
            }

            return (
              <TouchableOpacity
                key={opt.key}
                style={btnStyle as any}
                disabled={isAnswered || answering}
                onPress={() => handleSelectOption(opt.key)}
              >
                <View style={badgeStyle as any}>
                  <Text style={keyStyle as any}>{opt.key}</Text>
                </View>
                <Text style={textStyle as any}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Immediate Feedback & Solution Box */}
        {answerFeedback && (
          <View
            style={[
              styles.feedbackBox,
              answerFeedback.isCorrect ? styles.fbGreen : styles.fbRed,
            ]}
          >
            <View style={styles.feedbackHeader}>
              <Text
                style={[
                  styles.feedbackTitle,
                  answerFeedback.isCorrect ? styles.txtGreen : styles.txtRed,
                ]}
              >
                {answerFeedback.isCorrect
                  ? `✓ CORRECT! +${answerFeedback.xpEarned || 10} XP`
                  : '✕ INCORRECT'}
              </Text>
            </View>

            {answerFeedback.solution ? (
              <Text style={styles.solutionText}>
                Solution: {formatMathText(answerFeedback.solution)}
              </Text>
            ) : null}

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
    backgroundColor: '#310004', // OG Crackr Crimson
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  topBar: {
    height: 52,
    borderBottomWidth: 1.5,
    borderColor: '#6b0e18',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#480009',
  },
  backBtn: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#f2bf4b',
    fontWeight: '800',
  },
  title: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#ffdad8',
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  weakCard: {
    borderColor: '#8f1d1d',
    backgroundColor: '#4a0e17',
    marginBottom: 12,
  },
  weakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weakBadge: {
    color: '#ff8585',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  weakSub: {
    color: '#cdc6b7',
    fontSize: 12,
    marginBottom: 8,
  },
  weakTopicList: {
    gap: 4,
  },
  weakTopicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weakTopicName: {
    color: '#ffdad8',
    fontSize: 12,
    fontWeight: '700',
  },
  weakTopicAcc: {
    color: '#ff8585',
    fontSize: 11,
    fontWeight: '800',
  },
  setupHeading: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#f2bf4b',
    letterSpacing: 1.2,
    fontWeight: '900',
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
    backgroundColor: '#480009',
    borderWidth: 1.5,
    borderColor: '#6b0e18',
    borderRadius: 8,
    alignItems: 'center',
  },
  modeCardActive: {
    backgroundColor: '#f2bf4b',
    borderColor: '#f2bf4b',
  },
  modeText: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#ffdad8',
    fontWeight: '800',
  },
  modeTextActive: {
    color: '#310004',
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#480009',
    borderWidth: 1.5,
    borderColor: '#6b0e18',
    borderRadius: 8,
  },
  subjectBtnActive: {
    backgroundColor: '#5c010e',
    borderColor: '#f2bf4b',
  },
  subjectBtnText: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#cdc6b7',
    fontWeight: '800',
  },
  subjectBtnTextActive: {
    color: '#f2bf4b',
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#480009',
    borderWidth: 1.5,
    borderColor: '#6b0e18',
    borderRadius: 8,
    alignItems: 'center',
  },
  countBtnActive: {
    backgroundColor: '#f2bf4b',
    borderColor: '#f2bf4b',
  },
  countBtnText: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#ffdad8',
    fontWeight: '800',
  },
  countBtnTextActive: {
    color: '#310004',
  },
  startDock: {
    marginTop: 28,
  },
  loadingText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#f2bf4b',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '800',
  },
  gameHeader: {
    height: 52,
    borderBottomWidth: 1.5,
    borderColor: '#6b0e18',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#480009',
  },
  quitBtn: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#ff8585',
    fontWeight: '800',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '900',
    marginRight: 4,
  },
  levelUpBanner: {
    backgroundColor: '#f2bf4b',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpTitle: {
    color: '#310004',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  levelUpSub: {
    color: '#480009',
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#480009',
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
    fontFamily: 'System',
    fontSize: 11,
    color: '#cdc6b7',
    fontWeight: '800',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#6b0e18',
    backgroundColor: '#480009',
    borderRadius: 4,
  },
  iconBtnText: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '800',
  },
  questionCard: {
    backgroundColor: '#480009',
    borderColor: '#f2bf4b',
  },
  qSubjectTag: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  qText: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '700',
    color: '#ffdad8',
    lineHeight: 26,
  },
  optionsContainer: {
    marginTop: 16,
    gap: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#480009',
    borderWidth: 1.5,
    borderColor: '#6b0e18',
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionSelected: {
    backgroundColor: '#5c010e',
    borderColor: '#f2bf4b',
  },
  optionCorrect: {
    backgroundColor: '#1b4332',
    borderColor: '#2e7d32',
    borderLeftWidth: 6,
    borderLeftColor: '#4ade80',
  },
  optionIncorrect: {
    backgroundColor: '#4a0e17',
    borderColor: '#8f1d1d',
    borderLeftWidth: 6,
    borderLeftColor: '#ff8585',
  },
  optBadge: {
    width: 44,
    height: 48,
    borderRightWidth: 1.5,
    borderColor: '#6b0e18',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#310004',
  },
  optBadgeCorrect: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  optBadgeIncorrect: {
    backgroundColor: '#8f1d1d',
    borderColor: '#8f1d1d',
  },
  optKey: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#f2bf4b',
    fontWeight: '900',
  },
  optKeyCorrect: {
    color: '#ffffff',
  },
  optKeyIncorrect: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'System',
    fontSize: 14,
    color: '#ffdad8',
    lineHeight: 20,
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#4ade80',
    fontWeight: '800',
  },
  optionTextIncorrect: {
    color: '#ff8585',
    fontWeight: '800',
  },
  feedbackBox: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  fbGreen: {
    backgroundColor: '#1b4332',
    borderColor: '#2e7d32',
  },
  fbRed: {
    backgroundColor: '#4a0e17',
    borderColor: '#8f1d1d',
  },
  feedbackHeader: {
    marginBottom: 6,
  },
  feedbackTitle: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  txtGreen: {
    color: '#4ade80',
  },
  txtRed: {
    color: '#ff8585',
  },
  solutionText: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#ffdad8',
    marginVertical: 8,
    lineHeight: 20,
  },
  nextBtn: {
    height: 44,
    backgroundColor: '#f2bf4b',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  nextBtnText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#310004',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  finishedCard: {
    padding: 20,
    backgroundColor: '#480009',
    borderWidth: 1.5,
    borderColor: '#f2bf4b',
    borderRadius: 8,
  },
  finishedTitle: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '900',
    color: '#f2bf4b',
    textAlign: 'center',
    marginBottom: 16,
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
    borderWidth: 1.5,
    borderColor: '#6b0e18',
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '800',
  },
  scoreNum: {
    fontFamily: 'System',
    fontSize: 26,
    fontWeight: '900',
    color: '#ffdad8',
    marginTop: 4,
  },
  xpCard: {
    padding: 16,
    backgroundColor: '#5c010e',
    borderWidth: 1.5,
    borderColor: '#f2bf4b',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  xpLabel: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  xpNum: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  btnStack: {
    gap: 10,
  },
});
