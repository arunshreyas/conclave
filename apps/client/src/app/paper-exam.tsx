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
import { useRouter } from 'expo-router';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { api } from '@/services/api';
import { formatMathText, normalizeOptions } from '@/utils/textFormatter';

export default function PaperExamScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<any | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User responses
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeftSec, setTimeLeftSec] = useState(45 * 60);
  const [isExamStarted, setIsExamStarted] = useState(false);

  // Exam result
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  // Paper Generator Form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('MIXED');
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Countdown timer
  useEffect(() => {
    if (isExamStarted && !isSubmitted && timeLeftSec > 0) {
      const timer = setInterval(() => {
        setTimeLeftSec((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitPaper(); // auto submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isExamStarted, isSubmitted, timeLeftSec]);

  const handleGeneratePaper = async () => {
    try {
      setLoading(true);
      const res = await api.generateCustomPaper({
        title: title || `${subject} Mock Paper`,
        subject,
        difficulty,
        durationMinutes,
        totalQuestions: questionCount,
      });

      setPaper(res);
      setCurrentIndex(0);
      setUserAnswers({});
      setMarkedForReview({});
      setTimeLeftSec(res.durationMinutes * 60);
      setIsSubmitted(false);
      setIsExamStarted(true);
    } catch (err: any) {
      Alert.alert('Paper Generation Error', err.message || 'Failed to generate paper');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: string, optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  const toggleMarkForReview = (qId: string) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSubmitPaper = async () => {
    if (!paper) return;

    try {
      setLoading(true);
      const formattedAnswers = Object.entries(userAnswers).map(([qId, selectedAns]) => ({
        questionId: qId,
        selectedAnswer: selectedAns,
        timeSpentSec: 30,
      }));

      const totalTimeSpent = paper.durationMinutes * 60 - timeLeftSec;

      const result = await api.submitPaper(paper.paperId, {
        answers: formattedAnswers,
        totalTimeSpentSec: totalTimeSpent,
      });

      setExamResult(result);
      setIsSubmitted(true);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit exam paper');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Paper Generator Setup View
  if (!isExamStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>CUSTOM PAPER GENERATOR</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.setupHeading}>SUBJECT SELECTION</Text>
          <View style={styles.rowGrid}>
            {['Mixed', 'Physics', 'Chemistry', 'Mathematics'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chipBtn, subject === s && styles.chipBtnActive]}
                onPress={() => setSubject(s)}
              >
                <Text style={[styles.chipText, subject === s && styles.chipTextActive]}>{s.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.setupHeading}>DIFFICULTY DISTRIBUTION</Text>
          <View style={styles.rowGrid}>
            {['MIXED', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chipBtn, difficulty === d && styles.chipBtnActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.setupHeading}>QUESTION COUNT & DURATION</Text>
          <View style={styles.rowGrid}>
            {[
              { count: 10, dur: 15 },
              { count: 20, dur: 30 },
              { count: 30, dur: 45 },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.count}
                style={[styles.chipBtn, questionCount === opt.count && styles.chipBtnActive]}
                onPress={() => {
                  setQuestionCount(opt.count);
                  setDurationMinutes(opt.dur);
                }}
              >
                <Text style={[styles.chipText, questionCount === opt.count && styles.chipTextActive]}>
                  {opt.count} Qs ({opt.dur}m)
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.generateDock}>
            <BrutalistButton title="📝 GENERATE & START EXAM" variant="primary" onPress={handleGeneratePaper} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f2bf4b" />
        <Text style={styles.loadingText}>GENERATING CANDIDATE QUESTIONS & BUILDING PAPER...</Text>
      </SafeAreaView>
    );
  }

  // 2. Post-Test Analysis View
  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultCard}>
            <Text style={styles.resultHeading}>EXAM DIAGNOSTIC ANALYSIS 📊</Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>MARKS</Text>
                <Text style={styles.scoreNum}>
                  {examResult?.score || 0} / {examResult?.maxMarks || 0}
                </Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>ACCURACY</Text>
                <Text style={[styles.scoreNum, { color: '#f2bf4b' }]}>{examResult?.accuracy || 0}%</Text>
              </View>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.bdBox}>
                <Text style={styles.bdNum}>{examResult?.correctCount || 0}</Text>
                <Text style={styles.bdLabel}>CORRECT</Text>
              </View>
              <View style={styles.bdBox}>
                <Text style={[styles.bdNum, { color: '#F44336' }]}>{examResult?.incorrectCount || 0}</Text>
                <Text style={styles.bdLabel}>INCORRECT</Text>
              </View>
              <View style={styles.bdBox}>
                <Text style={[styles.bdNum, { color: '#969083' }]}>{examResult?.unattemptedCount || 0}</Text>
                <Text style={styles.bdLabel}>UNATTEMPTED</Text>
              </View>
            </View>

            {examResult?.weakTopics && examResult.weakTopics.length > 0 && (
              <View style={styles.weakBox}>
                <Text style={styles.weakHeading}>WEAK TOPICS IDENTIFIED ⚠️</Text>
                {examResult.weakTopics.map((wt: string) => (
                  <Text key={wt} style={styles.weakItem}>
                    • {wt}
                  </Text>
                ))}
                <TouchableOpacity
                  style={styles.practiceWeakBtn}
                  onPress={() => {
                    router.push({
                      pathname: '/rapid-fire',
                      params: { mode: 'WEAK_TOPICS', topic: examResult.weakTopics[0] },
                    });
                  }}
                >
                  <Text style={styles.practiceWeakText}>PRACTICE WEAK TOPICS NOW →</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.btnStack}>
              <BrutalistButton title="RETURN TO DASHBOARD" variant="primary" onPress={() => router.replace('/(tabs)')} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. Active Exam View
  const questionsList = paper?.questions || [];
  const currentQ = questionsList[currentIndex];
  const optionsList = normalizeOptions(currentQ?.options);

  const isCurrentMarked = markedForReview[currentQ?.questionId];
  const currentSelectedAns = userAnswers[currentQ?.questionId];

  return (
    <SafeAreaView style={styles.container}>
      {/* Exam Header */}
      <View style={styles.examHeader}>
        <Text style={styles.paperTitleText}>{paper?.title}</Text>
        <Text style={[styles.timerText, timeLeftSec < 300 && styles.timerDanger]}>
          ⏱️ {formatTime(timeLeftSec)}
        </Text>
      </View>

      {/* Question Navigation Matrix */}
      <View style={styles.matrixBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matrixScroll}>
          {questionsList.map((q: any, idx: number) => {
            const isAns = !!userAnswers[q.questionId];
            const isMrk = !!markedForReview[q.questionId];
            const isCur = idx === currentIndex;

            const cellStyle = [
              styles.matrixCell,
              isAns && styles.cellAnswered,
              isMrk && styles.cellMarked,
              isCur && styles.cellActive,
            ].filter(Boolean);

            return (
              <TouchableOpacity key={q.questionId} style={cellStyle} onPress={() => setCurrentIndex(idx)}>
                <Text style={styles.matrixText}>{idx + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.gameContent}>
        <View style={styles.qMetaRow}>
          <Text style={styles.qCounterText}>
            QUESTION {currentIndex + 1} OF {questionsList.length} (+4 / -1 Marks)
          </Text>
          <TouchableOpacity
            style={[styles.markBtn, isCurrentMarked && styles.markBtnActive]}
            onPress={() => toggleMarkForReview(currentQ?.questionId)}
          >
            <Text style={[styles.markBtnText, isCurrentMarked && styles.markBtnTextActive]}>
              {isCurrentMarked ? '🚩 MARKED' : '🚩 MARK'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Question Text */}
        <BrutalistCard highlight>
          <Text style={styles.qSubjectTag}>
            {currentQ?.subject} {currentQ?.chapter ? `// ${currentQ.chapter}` : ''}
          </Text>
          <Text style={styles.qText}>{currentQ?.question}</Text>
        </BrutalistCard>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {optionsList.map((opt) => {
            const isSelected = currentSelectedAns === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionBtn, isSelected && styles.optionSelected]}
                onPress={() => handleSelectAnswer(currentQ?.questionId, opt.key)}
              >
                <View style={[styles.optBadge, isSelected && styles.optBadgeSelected]}>
                  <Text style={[styles.optKey, isSelected && styles.optKeySelected]}>{opt.key}</Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Navigation & Submit Bar */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            disabled={currentIndex === 0}
            onPress={() => setCurrentIndex((prev) => prev - 1)}
          >
            <Text style={styles.navBtnText}>← PREV</Text>
          </TouchableOpacity>

          {currentIndex + 1 < questionsList.length ? (
            <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentIndex((prev) => prev + 1)}>
              <Text style={styles.navBtnText}>NEXT →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitExamBtn} onPress={handleSubmitPaper}>
              <Text style={styles.submitExamText}>SUBMIT EXAM ✓</Text>
            </TouchableOpacity>
          )}
        </View>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  setupHeading: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  rowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  chipBtnActive: {
    backgroundColor: '#ffffff',
  },
  chipText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#130f16',
  },
  generateDock: {
    marginTop: 32,
  },
  loadingText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    marginTop: 16,
    textAlign: 'center',
  },
  examHeader: {
    height: 48,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#270003',
  },
  paperTitleText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 12,
    color: '#ffdad8',
    fontWeight: '800',
  },
  timerText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 13,
    color: '#f2bf4b',
    fontWeight: '800',
  },
  timerDanger: {
    color: '#F44336',
  },
  matrixBar: {
    height: 44,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#310004',
  },
  matrixScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  matrixCell: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellAnswered: {
    backgroundColor: '#1b371b',
    borderColor: '#4CAF50',
  },
  cellMarked: {
    backgroundColor: '#382b00',
    borderColor: '#f2bf4b',
  },
  cellActive: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  matrixText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffdad8',
    fontWeight: '800',
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
  },
  markBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
  },
  markBtnActive: {
    backgroundColor: '#f2bf4b',
  },
  markBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  markBtnTextActive: {
    color: '#130f16',
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
  optionSelected: {
    backgroundColor: '#480009',
    borderColor: '#f2bf4b',
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
  optBadgeSelected: {
    backgroundColor: '#f2bf4b',
  },
  optKey: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#f2bf4b',
    fontWeight: '800',
  },
  optKeySelected: {
    color: '#130f16',
  },
  optionText: {
    flex: 1,
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#ffdad8',
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffdad8',
    fontWeight: '700',
  },
  submitExamBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#f2bf4b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitExamText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#130f16',
    fontWeight: '900',
  },
  resultCard: {
    padding: 20,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  resultHeading: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 22,
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
  breakdownRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 20,
  },
  bdBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#310004',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#4b463b',
  },
  bdNum: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    color: '#4CAF50',
  },
  bdLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#cdc6b7',
    marginTop: 2,
  },
  weakBox: {
    padding: 14,
    backgroundColor: '#480009',
    borderWidth: 1,
    borderColor: '#F44336',
    marginBottom: 20,
  },
  weakHeading: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffb4ab',
    fontWeight: '800',
    marginBottom: 8,
  },
  weakItem: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#ffdad8',
    marginBottom: 4,
  },
  practiceWeakBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#f2bf4b',
    alignItems: 'center',
  },
  practiceWeakText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#130f16',
    fontWeight: '900',
  },
  btnStack: {
    gap: 10,
  },
});
