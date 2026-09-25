import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistBadge, BrutalistButton, BrutalistCard } from '@/components/brutalist-ui';

export default function CrackrSpeedDrillScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState('PHYSICS');
  const [inProgress, setInProgress] = useState(false);
  const [score, setScore] = useState(0);

  const startDrill = () => {
    setInProgress(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← EXIT DRILL</Text>
        </TouchableOpacity>
        <Text style={styles.logoText}>CRACKR // SPEED MATRIX</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!inProgress ? (
          <>
            {/* Setup Header */}
            <View style={styles.headerSection}>
              <BrutalistBadge label="SPEED DRILL // HIGH YIELD" variant="gold" />
              <Text style={styles.title}>CRACKR SPEED DRILL</Text>
              <Text style={styles.subTitle}>
                10 rapid-fire JEE questions under strict 45-second timers to build instant recall & problem-solving momentum.
              </Text>
            </View>

            {/* Subject Selector */}
            <View style={styles.selectorBox}>
              <Text style={styles.sectionHeader}>{'// SELECT SPEED DRILL SUBJECT'}</Text>
              <View style={styles.chipRow}>
                {['PHYSICS', 'CHEMISTRY', 'MATHEMATICS'].map((subj) => (
                  <TouchableOpacity
                    key={subj}
                    onPress={() => setSelectedSubject(subj)}
                    style={[
                      styles.chip,
                      selectedSubject === subj && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedSubject === subj && styles.chipTextActive,
                      ]}
                    >
                      {subj}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Spec Matrix */}
            <BrutalistCard highlight>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>FORMAT:</Text>
                <Text style={styles.specVal}>10 QUESTIONS</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>TIME PER Q:</Text>
                <Text style={styles.specVal}>45 SECONDS</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>TARGET ACCURACY:</Text>
                <Text style={styles.specVal}>&gt; 90%</Text>
              </View>
            </BrutalistCard>

            <View style={styles.actionBox}>
              <BrutalistButton
                title="START SPEED ROUND"
                variant="secondary"
                onPress={startDrill}
              />
            </View>
          </>
        ) : (
          <>
            {/* Active Drill View */}
            <View style={styles.activeHeader}>
              <BrutalistBadge label="DRILL 01 / 10" variant="live" />
              <Text style={styles.timerCount}>⏱ 00:38</Text>
            </View>

            <BrutalistCard highlight>
              <Text style={styles.qHeader}>{selectedSubject} {'// RAPID QUESTION 01'}</Text>
              <Text style={styles.qText}>
                The dimensions of magnetic permeability μ₀ are given by:
              </Text>

              <View style={styles.drillOptions}>
                {[
                  'A) [M L T⁻² A⁻²]',
                  'B) [M L T⁻¹ A⁻²]',
                  'C) [M L T⁻² A⁻¹]',
                  'D) [M L² T⁻² A⁻²]',
                ].map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setScore(score + 10);
                      Alert.alert('Correct Answer!', '+10 XP to Speed Index');
                    }}
                    style={styles.drillOptBtn}
                  >
                    <Text style={styles.drillOptText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BrutalistCard>
          </>
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
  logoText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 24,
    fontWeight: '900',
    color: '#ffdad8',
    marginVertical: 6,
  },
  subTitle: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#cdc6b7',
    lineHeight: 20,
  },
  selectorBox: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#ffffff',
  },
  chipText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#130f16',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#cdc6b7',
  },
  specVal: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  actionBox: {
    marginTop: 20,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerCount: {
    fontFamily: 'Lexend, monospace',
    fontSize: 14,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  qHeader: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    marginBottom: 6,
  },
  qText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    color: '#ffdad8',
    fontWeight: '700',
    marginBottom: 16,
  },
  drillOptions: {
    gap: 8,
  },
  drillOptBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
  },
  drillOptText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 13,
    color: '#ffdad8',
    fontWeight: '700',
  },
});
