import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export const speechUtils = {
  speak(text: string) {
    if (!text) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      return;
    }

    try {
      Speech.stop();
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.95,
      });
    } catch (e) {
      console.warn('TTS speech failed:', e);
    }
  },

  stop() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      return;
    }
    try {
      Speech.stop();
    } catch (e) {
      console.warn('TTS stop failed:', e);
    }
  },

  startSTT(onResult: (transcript: string) => void, onError?: (err: string) => void) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        };

        recognition.onerror = (event: any) => {
          if (onError) onError(event.error || 'Speech recognition error');
        };

        recognition.start();
        return recognition;
      }
    }
    if (onError) {
      onError('Speech-to-text recognition is supported on web browsers with microphone permissions.');
    }
    return null;
  },
};
