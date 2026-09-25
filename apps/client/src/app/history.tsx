import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { api } from '@/services/api';
import { speechUtils } from '@/utils/speech';

export default function HistoryScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'SAVED' | 'ATTEMPTS'>('SAVED');
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [attemptItems, setAttemptItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'SAVED') {
        const res = await api.getSavedQuestions();
        setSavedItems(res || []);
      } else {
        const res = await api.getAttempts(30);
        setAttemptItems(res || []);
      }
    } catch (err: any) {
      console.warn('History load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (questionId: string) => {
    try {
      await api.unsaveQuestion(questionId);
      setSavedItems((prev) => prev.filter((item) => item.question?.id !== questionId));
    } catch (e) {
      console.warn('Unsave error:', e);
    }
  };

  const handleSpeak = (text: string) => {
    speechUtils.speak(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QUESTION HISTORY & BOOKMARKS</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'SAVED' && styles.tabBtnActive]}
          onPress={() => setActiveTab('SAVED')}
        >
          <Text style={[styles.tabText, activeTab === 'SAVED' && styles.tabTextActive]}>BOOKMARKED QUESTIONS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ATTEMPTS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ATTEMPTS')}
        >
          <Text style={[styles.tabText, activeTab === 'ATTEMPTS' && styles.tabTextActive]}>RECENT ATTEMPTS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#f2bf4b" />
          </View>
        ) : activeTab === 'SAVED' ? (
          savedItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No saved questions yet.</Text>
              <Text style={styles.emptySub}>Bookmark questions during Rapid Fire or Exam mode to review them later!</Text>
            </View>
          ) : (
            savedItems.map((item) => {
              const q = item.question;
              if (!q) return null;
              return (
                <BrutalistCard key={item.savedId} highlight>
                  <View style={styles.cardTop}>
                    <Text style={styles.qSubject}>
                      {q.subject} {q.chapter ? `// ${q.chapter}` : ''}
                    </Text>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleSpeak(q.question)}>
                        <Text style={styles.iconBtnText}>🔊 LISTEN</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleUnsave(q.id)}>
                        <Text style={styles.iconBtnText}>🗑️ REMOVE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.qText}>{q.question}</Text>
                  {q.answer && <Text style={styles.ansText}>Correct Answer: {q.answer}</Text>}
                  {q.solution && <Text style={styles.solText}>Solution: {q.solution}</Text>}
                </BrutalistCard>
              );
            })
          )
        ) : attemptItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No question attempts recorded yet.</Text>
            <Text style={styles.emptySub}>Start a Rapid Fire session or Practice drill to see your attempt history!</Text>
          </View>
        ) : (
          attemptItems.map((att) => (
            <BrutalistCard key={att.id}>
              <View style={styles.cardTop}>
                <Text style={styles.qSubject}>{att.subject} // ATTEMPT</Text>
                <BrutalistBadge
                  label={att.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                  variant={att.isCorrect ? 'live' : 'code'}
                />
              </View>

              <Text style={styles.qText}>{att.question?.question || 'Question Details'}</Text>
              <View style={styles.attemptMeta}>
                <Text style={styles.metaLabel}>Selected: {att.selectedAnswer}</Text>
                <Text style={styles.metaLabel}>Correct: {att.correctAnswer}</Text>
                <Text style={styles.metaLabel}>Time: {att.timeTakenSec}s</Text>
              </View>
            </BrutalistCard>
          ))
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
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#4b463b',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#270003',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#4b463b',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#130f16',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  center: {
    padding: 30,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffdad8',
  },
  emptySub: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#969083',
    textAlign: 'center',
    marginTop: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qSubject: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#310004',
  },
  iconBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#f2bf4b',
  },
  qText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: '#ffdad8',
    marginVertical: 4,
    lineHeight: 20,
  },
  ansText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#81C784',
    marginTop: 6,
  },
  solText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#cdc6b7',
    marginTop: 4,
    lineHeight: 18,
  },
  attemptMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metaLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
  },
});
