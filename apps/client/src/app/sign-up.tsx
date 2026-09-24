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
import { useAuth } from '@clerk/clerk-expo';
import { BrutalistButton, BrutalistBadge } from '@/components/brutalist-ui';
import { api } from '@/services/api';

export default function SignUpScreen() {
  const router = useRouter();
  const { getToken, userId } = useAuth();

  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('2007-05-15');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('12th');
  const [stream, setStream] = useState('JEE Advanced');

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckUsername = async () => {
    if (!userName.trim()) return;
    try {
      const res = await api.checkUsername(userName.trim());
      setUsernameAvailable(res.available);
    } catch (e) {
      setUsernameAvailable(null);
    }
  };

  const handleSubmit = async () => {
    if (!name || !userName || !email || !school) {
      Alert.alert('Missing Fields', 'Please fill out all required architectural spec fields.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await api.createProfile(token, {
        name,
        userName,
        email,
        birthday,
        school,
        grade,
        stream,
      });
      Alert.alert('Profile Initialized', 'Your profile matrix has been registered!', [
        { text: 'ENTER DASHBOARD', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Registration Error', err.message || 'Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>REGISTRATION SPEC</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Header */}
        <View style={styles.headerSection}>
          <BrutalistBadge label="SYS_REGISTER // MATRIX" variant="live" />
          <Text style={styles.title}>INITIALIZE STUDENT PROFILE</Text>
          <Text style={styles.subtitle}>
            Enter your academic & cognitive profile to configure the adaptive JEE practice matrix.
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Field: Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>1.0 // FULL NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Arjun Sharma"
              placeholderTextColor="#969083"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Field: Username */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>2.0 // USERNAME *</Text>
              {usernameAvailable !== null && (
                <Text
                  style={[
                    styles.statusText,
                    { color: usernameAvailable ? '#f2bf4b' : '#ffb4ab' },
                  ]}
                >
                  {usernameAvailable ? '[AVAILABLE]' : '[TAKEN]'}
                </Text>
              )}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. arjun_jee25"
                placeholderTextColor="#969083"
                value={userName}
                onChangeText={(text) => {
                  setUserName(text);
                  setUsernameAvailable(null);
                }}
              />
              <TouchableOpacity style={styles.checkBtn} onPress={handleCheckUsername}>
                <Text style={styles.checkBtnText}>CHECK</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Field: Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>3.0 // EMAIL ADDRESS *</Text>
            <TextInput
              style={styles.input}
              placeholder="arjun@example.com"
              placeholderTextColor="#969083"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Field: Birthday */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>4.0 // BIRTHDATE (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="2007-05-15"
              placeholderTextColor="#969083"
              value={birthday}
              onChangeText={setBirthday}
            />
          </View>

          {/* Field: School */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>5.0 // SCHOOL / INSTITUTION *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Delhi Public School, R.K. Puram"
              placeholderTextColor="#969083"
              value={school}
              onChangeText={setSchool}
            />
          </View>

          {/* Field: Grade Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>6.0 // ACADEMIC COHORT GRADE</Text>
            <View style={styles.chipRow}>
              {['11th', '12th', 'Dropper'].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGrade(g)}
                  style={[
                    styles.chip,
                    grade === g && styles.chipActive,
                  ]}
                >
                  <Text style={[styles.chipText, grade === g && styles.chipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Field: Target Stream */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>7.0 // TARGET EXAMINATION MATRIX</Text>
            <View style={styles.chipRow}>
              {['JEE Main', 'JEE Advanced'].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStream(s)}
                  style={[
                    styles.chip,
                    stream === s && styles.chipActive,
                  ]}
                >
                  <Text style={[styles.chipText, stream === s && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Action */}
        <View style={styles.actionBox}>
          <BrutalistButton
            title={loading ? 'INITIALIZING...' : 'INITIALIZE PROFILE & START'}
            variant="secondary"
            onPress={handleSubmit}
            disabled={loading}
          />
          <Text style={styles.securityNote}>
            PROCESSED VIA CONCLAVE SECURE NESTJS BACKEND SERVER
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
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  backBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffdad8',
    fontWeight: '700',
  },
  topBarTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 26,
    fontWeight: '900',
    color: '#ffdad8',
    marginVertical: 8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#cdc6b7',
    lineHeight: 20,
  },
  formContainer: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  statusText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    paddingHorizontal: 12,
    color: '#ffdad8',
    fontFamily: 'Lexend, sans-serif',
    fontSize: 14,
    borderRadius: 0,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#480009',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
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
    borderColor: '#ffffff',
  },
  chipText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#130f16',
  },
  actionBox: {
    marginTop: 24,
    marginBottom: 20,
  },
  securityNote: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#969083',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
});
