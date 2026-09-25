import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { authService } from '@/services/auth.service';
import { api } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { isSignedIn, profile: userProfile, refetch: refetchAuth } = useAuthStatus();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashData, setDashData] = useState<any | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashData(data);
    } catch (err: any) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleMenuPress = async () => {
    if (isSignedIn) {
      await authService.signOut();
      await refetchAuth();
      router.replace('/welcome');
    } else {
      router.push('/welcome');
    }
  };

  const userNameDisplay = dashData?.userName || userProfile?.name?.toUpperCase() || 'STUDENT';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoGroup}>
          <Text style={styles.terminalIcon}>&gt;_</Text>
          <Text style={styles.headerTitle}>CRACKR</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
            <Text style={styles.iconBtnText}>⚙️ SETTINGS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={handleMenuPress}>
            <Text style={styles.menuBtnText}>{isSignedIn ? 'LOGOUT' : 'MENU'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#f2bf4b" />}
      >
        {/* Identity & Status Banner */}
        <View style={styles.heroSection}>
          <View style={styles.sysRow}>
            <Text style={styles.sysLogText}>[SYS_LOG // {dashData?.grade || 'CLASS 12'}]</Text>
            <BrutalistBadge label={`LVL ${dashData?.level || 1}`} variant="live" />
          </View>
          <Text style={styles.heroTitle}>WELCOME BACK, {userNameDisplay}.</Text>
          <Text style={styles.heroSub}>
            Stream: {dashData?.stream || 'JEE Main'} • School: {dashData?.school || 'Crackr Platform'}
          </Text>
        </View>

        {/* Real Stats Grid */}
        <View style={styles.metricsGrid}>
          {/* Day Streak */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>DAY STREAK</Text>
            <Text style={styles.metricValue}>🔥 {dashData?.streak ?? 0}</Text>
            <Text style={styles.metricSub}>BEST: {dashData?.longestStreak ?? 0} DAYS</Text>
          </View>

          {/* XP Score */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TOTAL XP</Text>
            <Text style={[styles.metricValue, { color: '#ffffff' }]}>⭐ {dashData?.xp ?? 0}</Text>
            <Text style={styles.metricSub}>LEVEL {dashData?.level || 1} MASTERY</Text>
          </View>

          {/* Questions Solved & Accuracy */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ACCURACY</Text>
            <Text style={[styles.metricValue, { color: '#f2bf4b' }]}>{dashData?.overallAccuracy ?? 0}%</Text>
            <Text style={styles.metricSub}>{dashData?.totalQuestionsSolved ?? 0} SOLVED</Text>
          </View>
        </View>

        {/* Weak Topic Alert Box */}
        {dashData?.weakTopics && dashData.weakTopics.length > 0 && (
          <View style={styles.weakAlertBox}>
            <View style={styles.weakAlertHeader}>
              <Text style={styles.weakAlertTitle}>⚠ ADAPTIVE WEAK TOPIC DETECTED</Text>
              <BrutalistBadge label={`${dashData.weakTopics[0].accuracy}% ACCURACY`} variant="code" />
            </View>
            <Text style={styles.weakAlertTopic}>{dashData.weakTopics[0].topic}</Text>
            <Text style={styles.weakAlertDesc}>
              Performance history indicates lower accuracy in {dashData.weakTopics[0].topic}. Solve a 10-question Rapid Fire set to improve!
            </Text>
            <TouchableOpacity
              style={styles.weakAlertBtn}
              onPress={() =>
                router.push({
                  pathname: '/rapid-fire',
                  params: { mode: 'WEAK_TOPICS', topic: dashData.weakTopics[0].topic },
                })
              }
            >
              <Text style={styles.weakAlertBtnText}>PRACTICE WEAK TOPIC NOW →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Practice Launcher Dock */}
        <View style={styles.launchDock}>
          <Text style={styles.sectionHeader}>{'// PRODUCT SYSTEM DOCK'}</Text>
          <BrutalistButton
            title="🔥 LAUNCH RAPID FIRE DRILL"
            variant="secondary"
            onPress={() => router.push('/rapid-fire')}
          />
          <BrutalistButton
            title="📝 GENERATE CUSTOM EXAM PAPER"
            variant="primary"
            onPress={() => router.push('/paper-exam')}
          />
          <BrutalistButton
            title="📚 UPLOAD SYLLABUS & NOTES"
            variant="accent"
            onPress={() => router.push('/upload')}
          />
          <BrutalistButton
            title="🔖 BOOKMARKS & QUESTION HISTORY"
            variant="outline"
            onPress={() => router.push('/history')}
          />
        </View>

        {/* Subject Mastery Matrix */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionHeader}>{'// SUBJECT MASTERY MATRIX'}</Text>

          {(dashData?.subjectPerformance || [
            { subject: 'Physics', accuracy: 0, questionsSolved: 0 },
            { subject: 'Chemistry', accuracy: 0, questionsSolved: 0 },
            { subject: 'Mathematics', accuracy: 0, questionsSolved: 0 },
          ]).map((subj: any, idx: number) => (
            <BrutalistCard key={subj.subject}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTag}>0{idx + 1} // {subj.subject.toUpperCase()}</Text>
                <Text style={styles.cardPct}>{subj.accuracy}%</Text>
              </View>
              <Text style={styles.cardTitle}>{subj.subject} PYQ Question Bank Mastery</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.max(5, subj.accuracy)}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.cardBtn}
                onPress={() =>
                  router.push({
                    pathname: '/rapid-fire',
                    params: { mode: 'RAPID_FIRE', subject: subj.subject },
                  })
                }
              >
                <Text style={styles.cardBtnText}>PRACTICE {subj.subject.toUpperCase()} →</Text>
              </TouchableOpacity>
            </BrutalistCard>
          ))}
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
  topHeader: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#310004',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  terminalIcon: {
    fontFamily: 'Lexend, monospace',
    fontSize: 16,
    color: '#f2bf4b',
    fontWeight: '900',
  },
  headerTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 18,
    fontWeight: '900',
    color: '#ffdad8',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  iconBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  menuBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  menuBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    paddingBottom: 16,
  },
  sysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sysLogText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#969083',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 22,
    fontWeight: '900',
    color: '#ffdad8',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#cdc6b7',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    backgroundColor: '#270003',
    borderRightWidth: 1,
    borderColor: '#4b463b',
  },
  metricLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#cdc6b7',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    color: '#f2bf4b',
    marginVertical: 4,
  },
  metricSub: {
    fontFamily: 'Lexend, monospace',
    fontSize: 8,
    color: '#969083',
  },
  weakAlertBox: {
    padding: 14,
    backgroundColor: '#480009',
    borderWidth: 1,
    borderColor: '#F44336',
    marginBottom: 20,
  },
  weakAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weakAlertTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffb4ab',
    fontWeight: '800',
  },
  weakAlertTopic: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  weakAlertDesc: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#ffdad8',
    lineHeight: 18,
    marginBottom: 10,
  },
  weakAlertBtn: {
    paddingVertical: 8,
    backgroundColor: '#f2bf4b',
    alignItems: 'center',
  },
  weakAlertBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#130f16',
    fontWeight: '900',
  },
  launchDock: {
    marginBottom: 24,
    gap: 8,
  },
  sectionHeader: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  modulesSection: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTag: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  cardPct: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: '#ffdad8',
    marginVertical: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f2bf4b',
  },
  cardBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#480009',
  },
  cardBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffdad8',
    fontWeight: '700',
  },
});
