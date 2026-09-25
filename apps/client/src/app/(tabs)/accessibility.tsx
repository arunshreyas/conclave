import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { BrutalistCard, BrutalistBadge } from '@/components/brutalist-ui';

export default function AccessibilitySettingsScreen() {
  const [typeface, setTypeface] = useState<'LEXEND' | 'INTER' | 'OPENDYSLEXIC'>('LEXEND');
  const [fontSize, setFontSize] = useState<number>(18);
  const [highContrast, setHighContrast] = useState(true);
  const [speechRate, setSpeechRate] = useState('1.0x');
  const [noiseFilter, setNoiseFilter] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>ACCESSIBILITY ENGINE // SPEC</Text>
        <BrutalistBadge label="DYSLEXIA READY" variant="live" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro Section */}
        <View style={styles.introBox}>
          <Text style={styles.sectionHeader}>{'// READING & COGNITIVE CONTROLS'}</Text>
          <Text style={styles.introDesc}>
            Configure typography, speech dictation rates, and brutalist high-contrast borders for dyslexia & focus.
          </Text>
        </View>

        {/* Control 1: Typeface */}
        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>1.0 // TYPEFACE MATRIX</Text>
          <View style={styles.toggleGroup}>
            {(['INTER', 'LEXEND', 'OPENDYSLEXIC'] as const).map((tf) => (
              <TouchableOpacity
                key={tf}
                onPress={() => setTypeface(tf)}
                style={[
                  styles.toggleBtn,
                  typeface === tf && styles.toggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    typeface === tf && styles.toggleBtnTextActive,
                  ]}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Control 2: Font Size */}
        <View style={styles.controlSection}>
          <View style={styles.labelRow}>
            <Text style={styles.controlLabel}>2.0 // FONT SIZE DISPLAY</Text>
            <Text style={styles.valText}>{fontSize}PX</Text>
          </View>
          <View style={styles.toggleGroup}>
            {[14, 16, 18, 20, 22].map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setFontSize(size)}
                style={[
                  styles.toggleBtn,
                  fontSize === size && styles.toggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    fontSize === size && styles.toggleBtnTextActive,
                  ]}
                >
                  {size}px
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Control 3: Speech Synthesis Speed */}
        <View style={styles.controlSection}>
          <View style={styles.labelRow}>
            <Text style={styles.controlLabel}>3.0 // SPEECH SYNTHESIS RATE</Text>
            <Text style={styles.valText}>{speechRate}</Text>
          </View>
          <View style={styles.toggleGroup}>
            {['0.8x', '1.0x', '1.2x', '1.5x'].map((rate) => (
              <TouchableOpacity
                key={rate}
                onPress={() => setSpeechRate(rate)}
                style={[
                  styles.toggleBtn,
                  speechRate === rate && styles.toggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    speechRate === rate && styles.toggleBtnTextActive,
                  ]}
                >
                  {rate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Switches */}
        <BrutalistCard>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>HIGH-CONTRAST BORDERS</Text>
              <Text style={styles.switchSub}>Architectural 1px grid division</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#4b463b', true: '#f2bf4b' }}
              thumbColor="#ffffff"
            />
          </View>
        </BrutalistCard>

        <BrutalistCard>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>COGNITIVE NOISE FILTER</Text>
              <Text style={styles.switchSub}>Suppress non-essential visual elements</Text>
            </View>
            <Switch
              value={noiseFilter}
              onValueChange={setNoiseFilter}
              trackColor={{ false: '#4b463b', true: '#f2bf4b' }}
              thumbColor="#ffffff"
            />
          </View>
        </BrutalistCard>

        {/* Typography Preview Box */}
        <View style={styles.previewBox}>
          <Text style={styles.controlLabel}>TYPOGRAPHY PREVIEW // {typeface}</Text>
          <Text
            style={[
              styles.previewText,
              { fontSize },
            ]}
          >
            {'"A rigid body of mass M and radius R rotates about a fixed axis with angular velocity ω."'}
          </Text>
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
  introBox: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  introDesc: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#cdc6b7',
    lineHeight: 20,
  },
  controlSection: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
  valText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  toggleGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#270003',
    borderRightWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
  },
  toggleBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#130f16',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: '#ffdad8',
  },
  switchSub: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 11,
    color: '#cdc6b7',
    marginTop: 2,
  },
  previewBox: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#130f16',
  },
  previewText: {
    fontFamily: 'Lexend, sans-serif',
    color: '#ffdad8',
    lineHeight: 28,
    marginTop: 8,
  },
});
