import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { api } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadAuth() {
      try {
        const token = await getToken();
        if (token) {
          const status = await api.getAuthStatus(token);
          if (status?.profile) {
            setUserProfile(status.profile);
          }
        }
      } catch (e) {
        // Fallback or unauthenticated state
      }
    }
    loadAuth();
  }, []);

  const userNameDisplay = userProfile?.name?.toUpperCase() || 'ARJUN';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoGroup}>
          <Text style={styles.terminalIcon}>&gt;_</Text>
          <Text style={styles.headerTitle}>CRACKR</Text>
        </View>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => router.push('/welcome')}
        >
          <Text style={styles.menuBtnText}>MENU</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Identity Module */}
        <View style={styles.heroSection}>
          <View style={styles.sysRow}>
            <Text style={styles.sysLogText}>[SYS_LOG // COHORT 2025]</Text>
            <BrutalistBadge label="SYS.LIVE" variant="live" />
          </View>
          <Text style={styles.heroTitle}>READY FOR JEE, {userNameDisplay}.</Text>
          <Text style={styles.heroSub}>
            Phase: Final Sprint • Target: IIT Bombay [CSE] • 41 Days
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Day Streak */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>DAY STREAK</Text>
            <Text style={styles.metricValue}>14</Text>
            <Text style={styles.metricSub}>TOP 2% CONSISTENCY</Text>
          </View>

          {/* Accuracy */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ACCURACY</Text>
            <Text style={[styles.metricValue, { color: '#ffffff' }]}>88%</Text>
            <Text style={styles.metricSub}>+4.2% THIS WEEK</Text>
          </View>
        </View>

        {/* Quick Launcher Dock */}
        <View style={styles.launchDock}>
          <Text style={styles.sectionHeader}>// QUICK PRACTICE LAUNCHER</Text>
          <BrutalistButton
            title="LAUNCH CRACKR SPEED DRILL"
            variant="secondary"
            onPress={() => router.push('/crackr')}
          />
          <BrutalistButton
            title="START INTERACTIVE VOICE TEST"
            variant="primary"
            onPress={() => router.push('/test')}
          />
          <BrutalistButton
            title="SAHARA AI VOICE TUTOR"
            variant="accent"
            onPress={() => router.push('/sahara')}
          />
        </View>

        {/* Subject Modules */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionHeader}>// JEE SUBJECT MASTERY MATRIX</Text>

          {/* Physics Card */}
          <BrutalistCard>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>01 // PHYSICS</Text>
              <Text style={styles.cardPct}>84%</Text>
            </View>
            <Text style={styles.cardTitle}>Rotational Dynamics & Electrodynamics</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '84%' }]} />
            </View>
            <TouchableOpacity
              style={styles.cardBtn}
              onPress={() => router.push('/practice')}
            >
              <Text style={styles.cardBtnText}>PRACTICE MODULE →</Text>
            </TouchableOpacity>
          </BrutalistCard>

          {/* Chemistry Card */}
          <BrutalistCard>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>02 // CHEMISTRY</Text>
              <Text style={styles.cardPct}>92%</Text>
            </View>
            <Text style={styles.cardTitle}>Organic Reaction Mechanisms & Coordination</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '92%', backgroundColor: '#f2bf4b' }]} />
            </View>
            <TouchableOpacity
              style={styles.cardBtn}
              onPress={() => router.push('/practice')}
            >
              <Text style={styles.cardBtnText}>PRACTICE MODULE →</Text>
            </TouchableOpacity>
          </BrutalistCard>

          {/* Mathematics Card */}
          <BrutalistCard>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>03 // MATHEMATICS</Text>
              <Text style={styles.cardPct}>78%</Text>
            </View>
            <Text style={styles.cardTitle}>Integral Calculus & Vectors 3D</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '78%' }]} />
            </View>
            <TouchableOpacity
              style={styles.cardBtn}
              onPress={() => router.push('/practice')}
            >
              <Text style={styles.cardBtnText}>PRACTICE MODULE →</Text>
            </TouchableOpacity>
          </BrutalistCard>
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
    fontSize: 24,
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
  metricValue: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 36,
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
  launchDock: {
    marginBottom: 24,
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
    gap: 8,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#ffdad8',
    marginVertical: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
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
