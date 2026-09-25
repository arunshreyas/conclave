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
import { BrutalistCard, BrutalistBadge, BrutalistButton } from '@/components/brutalist-ui';
import { api } from '@/services/api';

export default function ProgressDashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [dashboard, setDashboard] = useState<any | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [anData, dashData] = await Promise.all([api.getAnalytics(), api.getDashboard()]);
      setAnalytics(anData);
      setDashboard(dashData);
    } catch (err) {
      console.warn('Progress load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>PROGRESS DIAGNOSTICS // MATRIX</Text>
        <BrutalistBadge label={`ACCURACY ${dashboard?.overallAccuracy || 0}%`} variant="gold" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Metric Summary */}
        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>OVERALL ACCURACY</Text>
            <Text style={styles.metricNum}>{dashboard?.overallAccuracy || 0}%</Text>
            <Text style={styles.metricSub}>{dashboard?.totalQuestionsSolved || 0} TOTAL SOLVED</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>MASTERY LEVEL</Text>
            <Text style={[styles.metricNum, { color: '#ffffff' }]}>LVL {dashboard?.level || 1}</Text>
            <Text style={styles.metricSub}>{dashboard?.xp || 0} XP EARNED</Text>
          </View>
        </View>

        {/* Diagnostic Analysis Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{'// COGNITIVE CHAPTER ACCURACY BREAKDOWN'}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#f2bf4b" style={{ marginVertical: 20 }} />
        ) : !analytics?.topicBreakdown || analytics.topicBreakdown.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No diagnostic attempts recorded yet.</Text>
            <Text style={styles.emptySub}>Complete a Rapid Fire session or Practice paper to see your topic diagnostics!</Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/rapid-fire')}>
              <Text style={styles.startBtnText}>START RAPID FIRE NOW →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          analytics.topicBreakdown.map((item: any, idx: number) => {
            const isWeak = item.accuracy < 65;
            return (
              <BrutalistCard key={`${item.subject}-${item.chapter}-${idx}`} highlight={isWeak}>
                <View style={styles.cardRow}>
                  <Text style={styles.tagText}>
                    {item.subject.toUpperCase()} // {isWeak ? 'CRITICAL FOCUS AREA ⚠️' : 'HIGH ACCURACY AREA'}
                  </Text>
                  <Text style={[styles.pctText, isWeak ? { color: '#F44336' } : { color: '#4CAF50' }]}>
                    {item.accuracy}%
                  </Text>
                </View>
                <Text style={styles.topicName}>{item.chapter}</Text>
                <Text style={styles.diagDesc}>
                  Total Attempts: {item.totalAttempts} • Average solving time: {item.avgTimeSec}s per problem.
                </Text>
                {isWeak && (
                  <TouchableOpacity
                    style={styles.drillBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/rapid-fire',
                        params: { mode: 'WEAK_TOPICS', topic: item.chapter },
                      })
                    }
                  >
                    <Text style={styles.drillBtnText}>LAUNCH TARGETED DRILL →</Text>
                  </TouchableOpacity>
                )}
              </BrutalistCard>
            );
          })
        )}

        {/* Action Callout */}
        <View style={styles.actionSection}>
          <BrutalistButton
            title="GENERATE FULL ACCURACY CUSTOM PAPER"
            variant="secondary"
            onPress={() => router.push('/paper-exam')}
          />
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
  metricGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    padding: 14,
    backgroundColor: '#270003',
    borderRightWidth: 1,
    borderColor: '#4b463b',
  },
  metricLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    letterSpacing: 1,
  },
  metricNum: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 32,
    fontWeight: '900',
    color: '#f2bf4b',
    marginVertical: 4,
  },
  metricSub: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#969083',
    letterSpacing: 1,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  pctText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 18,
    fontWeight: '800',
  },
  topicName: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffdad8',
    marginVertical: 6,
  },
  diagDesc: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#cdc6b7',
    lineHeight: 18,
    marginBottom: 10,
  },
  drillBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#f2bf4b',
    backgroundColor: '#261a00',
  },
  drillBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '800',
  },
  actionSection: {
    marginTop: 16,
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
  startBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f2bf4b',
  },
  startBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#130f16',
    fontWeight: '900',
  },
});
