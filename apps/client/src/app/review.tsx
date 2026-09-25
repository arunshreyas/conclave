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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { api } from '@/services/api';
import { formatMathText, normalizeOptions } from '@/utils/textFormatter';

export default function InternalReviewScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviewQuestions();
  }, []);

  const loadReviewQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestionsForReview(50);
      setQuestions(data || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch questions for review');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUsable = async (q: any) => {
    try {
      setUpdatingId(q.id);
      const updated = await api.updateQuestionReview(q.id, {
        is_usable: !q.is_usable,
      });
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, is_usable: updated.is_usable } : item)));
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update usability');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetQuality = async (q: any, quality: string) => {
    try {
      setUpdatingId(q.id);
      const updated = await api.updateQuestionReview(q.id, {
        question_quality: quality,
      });
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, question_quality: updated.question_quality } : item)));
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update quality');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← DASHBOARD</Text>
        </TouchableOpacity>
        <Text style={styles.title}>INTERNAL QUESTION AUDIT & REVIEW</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>
            Audit questions parsed from PDF pipeline. Filter out corrupted items or override quality ratings.
          </Text>
          <BrutalistBadge label={`${questions.length} AUDITED ITEMS`} variant="gold" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#f2bf4b" style={{ marginVertical: 40 }} />
        ) : questions.length === 0 ? (
          <BrutalistCard style={styles.centerCard}>
            <Text style={styles.emptyText}>No questions found for review.</Text>
          </BrutalistCard>
        ) : (
          questions.map((q, idx) => {
            const optionsList = normalizeOptions(q.options);
            return (
              <BrutalistCard key={q.id} highlight={!q.is_usable} style={styles.qCard}>
                <View style={styles.qHeader}>
                  <Text style={styles.qIndex}>#{idx + 1} // ID: {q.id.slice(0, 8)}...</Text>
                  <View style={styles.badgeGroup}>
                    <BrutalistBadge label={q.question_type || 'single_correct_mcq'} variant="code" />
                    <BrutalistBadge
                      label={q.is_usable ? 'USABLE ✓' : 'UNUSABLE ✕'}
                      variant={q.is_usable ? 'live' : 'crimson'}
                    />
                    <BrutalistBadge
                      label={q.question_quality ? q.question_quality.toUpperCase() : 'HIGH'}
                      variant={q.question_quality === 'high' ? 'gold' : q.question_quality === 'medium' ? 'code' : 'crimson'}
                    />
                  </View>
                </View>

                {/* Question Image if present */}
                {q.image_url && (
                  <View style={styles.imgContainer}>
                    <Image source={{ uri: q.image_url }} style={styles.qImage} resizeMode="contain" />
                  </View>
                )}

                <Text style={styles.qMeta}>
                  Subject: {q.subject} | Exam: {q.exam} ({q.year}) | Source: {q.source_file || 'N/A'} (P.{q.source_page || 1})
                </Text>

                <Text style={styles.qText}>{formatMathText(q.question)}</Text>

                {/* Options List */}
                {optionsList.length > 0 && (
                  <View style={styles.optionsGrid}>
                    {optionsList.map((opt) => (
                      <View key={opt.key} style={styles.optItem}>
                        <Text style={styles.optKey}>{opt.key}:</Text>
                        <Text style={styles.optText}>{opt.text}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.ansBox}>
                  <Text style={styles.ansText}>Answer: {q.answer || 'N/A'}</Text>
                  {q.solution && <Text style={styles.solText}>Solution: {q.solution}</Text>}
                </View>

                {/* Action Controls */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.usableBtn, q.is_usable ? styles.usableActive : styles.unusableActive]}
                    disabled={updatingId === q.id}
                    onPress={() => handleToggleUsable(q)}
                  >
                    <Text style={styles.actionBtnText}>
                      {q.is_usable ? 'MARK UNUSABLE ✕' : 'MARK USABLE ✓'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.qualityGroup}>
                    {['high', 'medium', 'low'].map((qual) => (
                      <TouchableOpacity
                        key={qual}
                        style={[styles.qualBtn, q.question_quality === qual && styles.qualBtnActive]}
                        disabled={updatingId === q.id}
                        onPress={() => handleSetQuality(q, qual)}
                      >
                        <Text style={[styles.qualText, q.question_quality === qual && styles.qualTextActive]}>
                          {qual.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </BrutalistCard>
            );
          })
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
  headerInfo: {
    marginBottom: 16,
    gap: 8,
  },
  headerText: {
    color: '#cdc6b7',
    fontSize: 12,
  },
  qCard: {
    marginBottom: 14,
    backgroundColor: '#480009',
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  qIndex: {
    color: '#f2bf4b',
    fontSize: 11,
    fontWeight: '900',
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  imgContainer: {
    height: 160,
    backgroundColor: '#310004',
    borderRadius: 6,
    marginVertical: 8,
    padding: 8,
  },
  qImage: {
    width: '100%',
    height: '100%',
  },
  qMeta: {
    color: '#cdc6b7',
    fontSize: 10,
    marginBottom: 6,
  },
  qText: {
    color: '#ffdad8',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 10,
  },
  optionsGrid: {
    gap: 4,
    marginVertical: 8,
  },
  optItem: {
    flexDirection: 'row',
    gap: 6,
  },
  optKey: {
    color: '#f2bf4b',
    fontSize: 12,
    fontWeight: '800',
  },
  optText: {
    color: '#ffdad8',
    fontSize: 12,
  },
  ansBox: {
    padding: 8,
    backgroundColor: '#310004',
    borderRadius: 4,
    marginVertical: 8,
  },
  ansText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '800',
  },
  solText: {
    color: '#cdc6b7',
    fontSize: 11,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  usableBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  usableActive: {
    backgroundColor: '#4a0e17',
    borderColor: '#ff8585',
  },
  unusableActive: {
    backgroundColor: '#1b4332',
    borderColor: '#4ade80',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  qualityGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  qualBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#310004',
    borderWidth: 1,
    borderColor: '#6b0e18',
    borderRadius: 4,
  },
  qualBtnActive: {
    backgroundColor: '#f2bf4b',
    borderColor: '#f2bf4b',
  },
  qualText: {
    color: '#cdc6b7',
    fontSize: 10,
    fontWeight: '800',
  },
  qualTextActive: {
    color: '#310004',
  },
  centerCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#cdc6b7',
    fontSize: 13,
  },
});
