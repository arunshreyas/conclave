import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistBadge, BrutalistButton, BrutalistCard } from '@/components/brutalist-ui';

export default function AIReviewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK TO TEST</Text>
        </TouchableOpacity>
        <BrutalistBadge label="SOLUTION VERIFIED" variant="gold" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.headerSection}>
          <Text style={styles.tagline}>[SYS_SOLVER // VERIFICATION MATRIX]</Text>
          <Text style={styles.title}>CORRECT ANSWER: OPTION A</Text>
          <Text style={styles.subTitle}>a = (5/7) g sin θ</Text>
        </View>

        {/* Diagnostic Accuracy Banner */}
        <View style={styles.scoreBanner}>
          <Text style={styles.scoreLabel}>CONCLAVE ACCURACY MATCH</Text>
          <Text style={styles.scoreVal}>100% MATCH</Text>
        </View>

        {/* Step-by-Step Reasoning breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>// STEP 1.0: FORCE & TORQUE EQUATIONS</Text>
          <BrutalistCard>
            <Text style={styles.mathBlock}>1) Mg sin θ - f = M a</Text>
            <Text style={styles.mathBlock}>2) Torque τ = f · R = I α</Text>
            <Text style={styles.explanationText}>
              For a solid uniform sphere, moment of inertia I = (2/5) M R².
            </Text>
          </BrutalistCard>

          <Text style={styles.sectionHeader}>// STEP 2.0: NO-SLIP CONSTRAINT</Text>
          <BrutalistCard>
            <Text style={styles.mathBlock}>3) Rolling without slipping implies a = α · R</Text>
            <Text style={styles.mathBlock}>4) Friction force f = (2/5) M a</Text>
            <Text style={styles.explanationText}>
              Substituting friction into equation (1) yields Mg sin θ = M a + (2/5) M a = (7/5) M a.
            </Text>
          </BrutalistCard>

          <Text style={styles.sectionHeader}>// STEP 3.0: FINAL ACCELERATION RESULT</Text>
          <BrutalistCard highlight>
            <Text style={styles.resultMath}>a = (5/7) g sin θ</Text>
            <Text style={styles.trapWarning}>
              ⚠️ TRAP ALERT: Do not confuse solid sphere (2/5) with spherical shell (2/3) or cylinder (1/2).
            </Text>
          </BrutalistCard>
        </View>

        {/* Action Dock */}
        <View style={styles.actionDock}>
          <BrutalistButton
            title="NEXT QUESTION →"
            variant="secondary"
            onPress={() => router.push('/test')}
          />
          <BrutalistButton
            title="ASK SAHARA AI TO EXPLAIN AUDIO"
            variant="accent"
            onPress={() => router.push('/sahara')}
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
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  backBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffdad8',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 16,
  },
  tagline: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 22,
    fontWeight: '900',
    color: '#ffdad8',
    marginVertical: 4,
  },
  subTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 14,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  scoreBanner: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#f2bf4b',
    backgroundColor: '#261a00',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  scoreVal: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 14,
    fontWeight: '800',
    color: '#f2bf4b',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginTop: 8,
  },
  mathBlock: {
    fontFamily: 'Lexend, monospace',
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    marginVertical: 2,
  },
  explanationText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#cdc6b7',
    lineHeight: 18,
    marginTop: 6,
  },
  resultMath: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    color: '#f2bf4b',
  },
  trapWarning: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#ffb4ab',
    marginTop: 8,
    lineHeight: 18,
  },
  actionDock: {
    marginTop: 24,
    gap: 8,
  },
});
