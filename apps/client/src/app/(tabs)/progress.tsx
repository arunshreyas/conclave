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
import { BrutalistCard, BrutalistBadge, BrutalistButton } from '@/components/brutalist-ui';

export default function ProgressDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>PROGRESS DIAGNOSTICS // MATRIX</Text>
        <BrutalistBadge label="JEE 2025" variant="gold" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Metric Summary */}
        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>OVERALL ACCURACY</Text>
            <Text style={styles.metricNum}>88%</Text>
            <Text style={styles.metricSub}>+4.2% THIS WEEK</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>SOLVE SPEED</Text>
            <Text style={[styles.metricNum, { color: '#ffffff' }]}>1.8m</Text>
            <Text style={styles.metricSub}>PER JEE QUESTION</Text>
          </View>
        </View>

        {/* Diagnostic Analysis Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{'// COGNITIVE DIAGNOSTIC BREAKDOWN'}</Text>
        </View>

        <BrutalistCard highlight>
          <View style={styles.cardRow}>
            <Text style={styles.tagText}>CRITICAL FOCUS AREA</Text>
            <Text style={styles.pctText}>68%</Text>
          </View>
          <Text style={styles.topicName}>PHYSICS // Rotational Dynamics</Text>
          <Text style={styles.diagDesc}>
            Trap Alert: Miscalculation of moment of inertia about non-centroidal parallel axes.
          </Text>
          <TouchableOpacity
            style={styles.drillBtn}
            onPress={() => router.push('/crackr')}
          >
            <Text style={styles.drillBtnText}>LAUNCH TARGETED DRILL →</Text>
          </TouchableOpacity>
        </BrutalistCard>

        <BrutalistCard>
          <View style={styles.cardRow}>
            <Text style={styles.tagText}>HIGH ACCURACY DOMAIN</Text>
            <Text style={[styles.pctText, { color: '#f2bf4b' }]}>92%</Text>
          </View>
          <Text style={styles.topicName}>CHEMISTRY // Organic Mechanisms</Text>
          <Text style={styles.diagDesc}>
            Strong conceptual mastery of electrophilic addition & stereochemistry.
          </Text>
        </BrutalistCard>

        <BrutalistCard>
          <View style={styles.cardRow}>
            <Text style={styles.tagText}>MODERATE SPEED AREA</Text>
            <Text style={[styles.pctText, { color: '#ffdad8' }]}>74%</Text>
          </View>
          <Text style={styles.topicName}>MATH // Definite Integration</Text>
          <Text style={styles.diagDesc}>
            Average solving time 2.4 minutes. Opportunity to apply substitution shortcuts.
          </Text>
        </BrutalistCard>

        {/* Action Callout */}
        <View style={styles.actionSection}>
          <BrutalistButton
            title="LAUNCH FULL ACCURACY SIMULATION"
            variant="secondary"
            onPress={() => router.push('/test')}
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
    color: '#ffb4ab',
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
});
