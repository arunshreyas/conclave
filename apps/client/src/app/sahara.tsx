import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';

export default function SaharaAIScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'sahara',
      text: 'SYSTEM ONLINE. I am Sahara, your voice-enabled AI tutor for JEE Physics, Chemistry & Mathematics. Ask any doubt or concept deconstruction.',
    },
    {
      sender: 'user',
      text: 'Why does rolling without slipping involve static friction instead of kinetic friction?',
    },
    {
      sender: 'sahara',
      text: 'When a sphere or cylinder rolls without slipping, the point of contact with the ground has zero relative velocity at that instant (v_contact = 0). Because there is no sliding motion between the surfaces, the frictional force is static friction. It prevents slipping and does no work overall.',
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'sahara',
          text: `Analyzing "${userMsg}"... Recommendation: Apply conservation of angular momentum about the point of contact to eliminate normal torque.`,
        },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← EXIT SAHARA</Text>
        </TouchableOpacity>
        <BrutalistBadge label="VOICE ENGINE ACTIVE" variant="live" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>SAHARA AI VOICE TUTOR</Text>
          <Text style={styles.subTitle}>
            Real-time concept deconstruction & voice dictation assistant.
          </Text>
        </View>

        {/* Audio Wave Monitor Box */}
        <View style={styles.waveMonitor}>
          <View style={styles.waveHeader}>
            <Text style={styles.waveLabel}>AUDIO SIGNAL SPECTRUM</Text>
            <Text style={styles.waveStatus}>
              {isListening ? 'LISTENING...' : 'STANDBY // READY'}
            </Text>
          </View>
          <View style={styles.waveBars}>
            {[40, 75, 30, 90, 60, 100, 45, 80, 50, 70, 35, 85].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { height: isListening ? h : 16 },
                  i % 3 === 0 && { backgroundColor: '#f2bf4b' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Chat History Log */}
        <View style={styles.chatLog}>
          {messages.map((msg, index) => (
            <BrutalistCard
              key={index}
              highlight={msg.sender === 'sahara'}
              style={msg.sender === 'user' ? styles.userCard : styles.saharaCard}
            >
              <Text
                style={[
                  styles.senderTag,
                  msg.sender === 'sahara' ? { color: '#f2bf4b' } : { color: '#cdc6b7' },
                ]}
              >
                {msg.sender === 'sahara' ? '// SAHARA AI TUTOR' : '// STUDENT INPUT'}
              </Text>
              <Text style={styles.msgText}>{msg.text}</Text>
            </BrutalistCard>
          ))}
        </View>
      </ScrollView>

      {/* Input Dock */}
      <View style={styles.inputDock}>
        <TouchableOpacity
          onPress={() => setIsListening(!isListening)}
          style={[styles.micBtn, isListening && styles.micBtnActive]}
        >
          <Text style={styles.micBtnText}>{isListening ? '🎙 ON' : '🎙 MIC'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Ask Sahara a doubt or dictation..."
          placeholderTextColor="#969083"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>SEND</Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 22,
    fontWeight: '900',
    color: '#ffdad8',
  },
  subTitle: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#cdc6b7',
    marginTop: 2,
  },
  waveMonitor: {
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#130f16',
    padding: 12,
    marginBottom: 16,
  },
  waveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  waveLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    letterSpacing: 1,
  },
  waveStatus: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 50,
  },
  waveBar: {
    width: 6,
    backgroundColor: '#ffffff',
  },
  chatLog: {
    gap: 10,
  },
  saharaCard: {
    backgroundColor: '#310004',
  },
  userCard: {
    backgroundColor: '#270003',
  },
  senderTag: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  msgText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#ffdad8',
    lineHeight: 20,
  },
  inputDock: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#130f16',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  micBtn: {
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: {
    backgroundColor: '#5c010e',
    borderColor: '#ffb4ab',
  },
  micBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    paddingHorizontal: 12,
    color: '#ffdad8',
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f2bf4b',
    backgroundColor: '#f2bf4b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#261a00',
    fontWeight: '800',
  },
});
