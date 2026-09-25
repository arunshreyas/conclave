import React, { useState, useEffect } from 'react';
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
import { BrutalistButton, BrutalistBadge } from '@/components/brutalist-ui';
import { api } from '@/services/api';
import { authService } from '@/services/auth.service';
import { useAuthStatus } from '@/hooks/useAuthStatus';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, refetch } = useAuthStatus();

  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setSchool(profile.school || '');
      setGrade(profile.grade || 'Class 12');
      setStream(profile.stream || 'JEE Main');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await api.updateMyProfile({
        name,
        school,
        grade,
        stream,
      });
      await refetch();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    await refetch();
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS & PROFILE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.heading}>STUDENT IDENTITY</Text>

          <Text style={styles.label}>FULL NAME</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Student Name" placeholderTextColor="#969083" />

          <Text style={styles.label}>SCHOOL / INSTITUTE</Text>
          <TextInput style={styles.input} value={school} onChangeText={setSchool} placeholder="School Name" placeholderTextColor="#969083" />

          <Text style={styles.label}>TARGET GRADE & STREAM</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.half]} value={grade} onChangeText={setGrade} placeholder="Grade" placeholderTextColor="#969083" />
            <TextInput style={[styles.input, styles.half]} value={stream} onChangeText={setStream} placeholder="Stream" placeholderTextColor="#969083" />
          </View>

          <TouchableOpacity style={styles.saveBtn} disabled={saving} onPress={handleSaveProfile}>
            <Text style={styles.saveBtnText}>{saving ? 'SAVING...' : 'SAVE PROFILE CHANGES ✓'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>SYSTEM & AUDIO PREFERENCES</Text>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>TEXT-TO-SPEECH (TTS) AUDIO</Text>
            <BrutalistBadge label="ACTIVE ✓" variant="live" />
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>SPEECH-TO-TEXT (STT) MIC</Text>
            <BrutalistBadge label="ACTIVE ✓" variant="live" />
          </View>
        </View>

        <View style={styles.logoutDock}>
          <BrutalistButton title="SIGN OUT OF CRACKR" variant="secondary" onPress={handleLogout} />
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
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  heading: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#cdc6b7',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#310004',
    paddingHorizontal: 12,
    color: '#ffdad8',
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
  saveBtn: {
    height: 42,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#130f16',
    fontWeight: '900',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
  },
  prefLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffdad8',
  },
  logoutDock: {
    marginTop: 12,
  },
});
