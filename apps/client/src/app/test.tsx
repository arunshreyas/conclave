import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistBadge, BrutalistButton, BrutalistCard } from '@/components/brutalist-ui';

export default function InteractiveTestScreen() {
  const router = useRouter();
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { key: 'A', text: 'a = (5/7) g sin θ' },
    { key: 'B', text: 'a = (2/5) g sin θ' },
    { key: 'C', text: 'a = (3/5) g sin θ' },
    { key: 'D', text: 'a = (7/5) g sin θ' },
  ];

  const handleVoiceToggle = () => {
    setVoiceRecording(!voiceRecording);
    if (!voiceRecording) {
      setTimeout(() => {
        setAnswerText('a = (5/7) g sin θ because I = 2/5 M R^2 for solid sphere');
      }, 1500);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption && !answerText) {
      Alert.alert('Selection Required', 'Please select an option or record your voice answer.');
      return;
    }
    router.push('/ai-review');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← EXIT TEST</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>⏱ 02:45</Text>
        <TouchableOpacity
          onPress={() => setDyslexiaMode(!dyslexiaMode)}
          style={[styles.dyslexiaBtn, dyslexiaMode && styles.dyslexiaBtnActive]}
        >
          <Text style={[styles.dyslexiaBtnText, dyslexiaMode && styles.dyslexiaBtnTextActive]}>
            DYSLEXIA MODE
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Meta Header */}
        <View style={styles.metaRow}>
          <BrutalistBadge label="QUESTION 03 / 10" variant="live" />
          <BrutalistBadge label="PHY-102 // ROTATIONAL" variant="code" />
        </View>

        {/* Question Statement Card */}
        <BrutalistCard highlight>
          <Text style={styles.qSubject}>JEE ADVANCED // PHYSICS</Text>
          <Text style={[styles.qStatement, dyslexiaMode && styles.dyslexiaText]}>
            A solid uniform sphere of mass M and radius R rolls without slipping down a rough inclined plane making an angle θ with the horizontal.
            {'\n\n'}
            Determine the exact expression for the linear acceleration a of the center of mass.
          </Text>
        </BrutalistCard>

        {/* Multiple Choice Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionHeader}>{'// SELECT MULTIPLE CHOICE ANSWER'}</Text>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSelectedOption(opt.key)}
              style={[
                styles.optionCard,
                selectedOption === opt.key && styles.optionCardSelected,
              ]}
            >
              <View style={[styles.optBadge, selectedOption === opt.key && styles.optBadgeSelected]}>
                <Text style={[styles.optKey, selectedOption === opt.key && styles.optKeySelected]}>
                  {opt.key}
                </Text>
              </View>
              <Text style={[styles.optText, dyslexiaMode && styles.dyslexiaText]}>{opt.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voice Dictation Matrix */}
        <View style={styles.voiceSection}>
          <Text style={styles.sectionHeader}>{'// SPEECH-TO-TEXT DICTATION MATRIX'}</Text>
          <View style={styles.micCard}>
            <TouchableOpacity
              onPress={handleVoiceToggle}
              style={[styles.micCircle, voiceRecording && styles.micCircleActive]}
            >
              <Text style={styles.micIcon}>{voiceRecording ? '🎙 REC...' : '🎙 TAP TO SPEAK'}</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.answerInput, dyslexiaMode && styles.dyslexiaText]}
              placeholder="Spoken or typed reasoning dictation..."
              placeholderTextColor="#969083"
              multiline
              value={answerText}
              onChangeText={setAnswerText}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <BrutalistButton
          title="ASK SAHARA AI HINT"
          variant="outline"
          onPress={() => router.push('/sahara')}
        />
        <BrutalistButton
          title="SUBMIT ANSWER & SEE REASONING"
          variant="secondary"
          onPress={handleSubmit}
        />
      </View>
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
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  backBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffdad8',
    fontWeight: '700',
  },
  timerText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  dyslexiaBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
  },
  dyslexiaBtnActive: {
    backgroundColor: '#ffffff',
  },
  dyslexiaBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  dyslexiaBtnTextActive: {
    color: '#130f16',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  qSubject: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    marginBottom: 6,
  },
  qStatement: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 15,
    color: '#ffdad8',
    lineHeight: 24,
  },
  dyslexiaText: {
    letterSpacing: 0.8,
    lineHeight: 28,
  },
  optionsContainer: {
    marginVertical: 16,
    gap: 8,
  },
  sectionHeader: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 6,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    gap: 12,
  },
  optionCardSelected: {
    borderColor: '#f2bf4b',
    backgroundColor: '#480009',
  },
  optBadge: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#310004',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optBadgeSelected: {
    backgroundColor: '#f2bf4b',
    borderColor: '#f2bf4b',
  },
  optKey: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    fontWeight: '800',
    color: '#ffdad8',
  },
  optKeySelected: {
    color: '#261a00',
  },
  optText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 14,
    color: '#ffdad8',
    flex: 1,
  },
  voiceSection: {
    marginTop: 8,
  },
  micCard: {
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#130f16',
    padding: 12,
    gap: 12,
  },
  micCircle: {
    height: 40,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#480009',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micCircleActive: {
    backgroundColor: '#5c010e',
    borderColor: '#ffb4ab',
  },
  micIcon: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  answerInput: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    padding: 8,
    color: '#ffdad8',
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#130f16',
    gap: 8,
  },
});
