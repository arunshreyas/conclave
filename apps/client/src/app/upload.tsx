import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { api } from '@/services/api';

export default function DocumentUploadScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('SYLLABUS'); // SYLLABUS | NOTES
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedResult, setProcessedResult] = useState<any | null>(null);

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your document');
      return;
    }
    if (!text.trim()) {
      Alert.alert('Validation Error', 'Please paste or enter syllabus / notes text');
      return;
    }

    try {
      setLoading(true);
      const res = await api.uploadDocument({
        title,
        docType,
        text,
      });

      setProcessedResult(res);
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to process document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DOCUMENT UPLOAD // SYLLABUS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {processedResult ? (
          <View style={styles.successCard}>
            <View style={styles.statusRow}>
              <Text style={styles.successHeading}>DOCUMENT PROCESSED ✓</Text>
              <BrutalistBadge label="PROCESSED" variant="live" />
            </View>
            <Text style={styles.docTitle}>{processedResult.title}</Text>
            <Text style={styles.metaText}>TYPE: {processedResult.docType}</Text>

            <View style={styles.syllabusBox}>
              <Text style={styles.syllabusHeading}>EXTRACTED SYLLABUS STRUCTURE:</Text>
              {Object.entries(processedResult.extractedSyllabus || {}).map(([subj, topics]: [string, any]) => (
                <View key={subj} style={styles.subjSection}>
                  <Text style={styles.subjTitle}>{subj.toUpperCase()}</Text>
                  {Array.isArray(topics) &&
                    topics.map((top: string) => (
                      <Text key={top} style={styles.topicTag}>
                        • {top}
                      </Text>
                    ))}
                </View>
              ))}
            </View>

            <View style={styles.btnStack}>
              <BrutalistButton
                title="GENERATE CUSTOM PAPER FROM THIS SYLLABUS"
                variant="primary"
                onPress={() => router.push('/paper-exam')}
              />
              <BrutalistButton
                title="UPLOAD ANOTHER DOCUMENT"
                variant="secondary"
                onPress={() => {
                  setProcessedResult(null);
                  setTitle('');
                  setText('');
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.setupHeading}>DOCUMENT TYPE</Text>
            <View style={styles.typeRow}>
              {[
                { id: 'SYLLABUS', label: 'SYLLABUS PDF/TEXT' },
                { id: 'NOTES', label: 'CLASS NOTES' },
              ].map((dt) => (
                <TouchableOpacity
                  key={dt.id}
                  style={[styles.typeBtn, docType === dt.id && styles.typeBtnActive]}
                  onPress={() => setDocType(dt.id)}
                >
                  <Text style={[styles.typeText, docType === dt.id && styles.typeTextActive]}>{dt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.setupHeading}>DOCUMENT TITLE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Physics Final Revision Syllabus 2026..."
              placeholderTextColor="#969083"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.setupHeading}>SYLLABUS / NOTES CONTENT (TEXT/PASTE)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Paste syllabus text or class notes here (e.g. Work Power Energy, Rotational Motion, Redox Reactions, Straight Lines)..."
              placeholderTextColor="#969083"
              multiline
              numberOfLines={8}
              value={text}
              onChangeText={setText}
            />

            <View style={styles.submitDock}>
              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color="#f2bf4b" />
                  <Text style={styles.loadingText}>PROCESSING DOCUMENT & CHUNKING TEXT...</Text>
                </View>
              ) : (
                <BrutalistButton title="📥 UPLOAD & EXTRACT SYLLABUS" variant="primary" onPress={handleUpload} />
              )}
            </View>
          </View>
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
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffdad8',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formSection: {
    gap: 12,
  },
  setupHeading: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    marginTop: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#ffffff',
  },
  typeText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffdad8',
    fontWeight: '700',
  },
  typeTextActive: {
    color: '#130f16',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffdad8',
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
  },
  textArea: {
    height: 160,
    textAlignVertical: 'top',
  },
  submitDock: {
    marginTop: 20,
  },
  loadingBox: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
  },
  successCard: {
    padding: 18,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  successHeading: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 18,
    fontWeight: '900',
    color: '#4CAF50',
  },
  docTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffdad8',
  },
  metaText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    marginVertical: 4,
  },
  syllabusBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#310004',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  syllabusHeading: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '800',
    marginBottom: 10,
  },
  subjSection: {
    marginBottom: 10,
  },
  subjTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  topicTag: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#ffdad8',
    marginLeft: 8,
    marginTop: 2,
  },
  btnStack: {
    marginTop: 20,
    gap: 10,
  },
});
