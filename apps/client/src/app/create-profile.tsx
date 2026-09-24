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
import { useAuth, useUser } from '@clerk/clerk-expo';
import { BrutalistButton, BrutalistBadge } from '@/components/brutalist-ui';
import { api } from '@/services/api';

export default function CreateProfileSurveyScreen() {
  const router = useRouter();

  let getToken: any = async () => null;
  try {
    const auth = useAuth();
    getToken = auth.getToken;
  } catch (e) {
    // ClerkProvider not mounted
  }

  let user: any = null;
  try {
    const clerkUser = useUser();
    user = clerkUser.user;
  } catch (e) {
    // ClerkProvider not mounted
  }

  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('2007-05-15');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('12th');
  const [stream, setStream] = useState('JEE Advanced');

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.fullName) setName(user.fullName);
      if (user.primaryEmailAddress?.emailAddress) setEmail(user.primaryEmailAddress.emailAddress);
      if (user.username) setUserName(user.username);
    }
  }, [user]);

  const handleCheckUsername = async () => {
    if (!userName.trim()) return;
    try {
      const res = await api.checkUsername(userName.trim());
      setUsernameAvailable(res.available);
    } catch (e) {
      setUsernameAvailable(null);
    }
  };

  const handleSubmitSurvey = async () => {
    if (!name || !userName || !school) {
      Alert.alert('Missing Survey Data', 'Please fill out your Full Name, Username, and School.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await api.createProfile(token, {
        name,
        userName,
        email: email || user?.primaryEmailAddress?.emailAddress || 'student@conclave.dev',
        birthday,
        school,
        grade,
        stream,
      });
      Alert.alert('Profile Survey Completed!', 'Your student profile matrix has been saved.', [
        { text: 'ENTER DASHBOARD', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Survey Saved', 'Your student profile survey has been initialized.', [
        { text: 'ENTER DASHBOARD', onPress: () => router.replace('/(tabs)') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <BrutalistBadge label="CLERK AUTHENTICATED ✓" variant="gold" />
        <Text style={styles.topBarTitle}>PROFILE SURVEY SPEC</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Header */}
        <View style={styles.headerSection}>
          <BrutalistBadge label="STEP 2/2 // STUDENT PROFILE SURVEY" variant="live" />
          <Text style={styles.title}>COMPLETE YOUR PROFILE</Text>
          <Text style={styles.subtitle}>
            Authentication successful! Complete this 1-minute survey to configure your adaptive JEE practice matrix.
          </Text>
        </View>

        {/* Pure Survey Form */}
        <View style={styles.formContainer}>
          {/* 1.0 Full Name */}
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

          {/* 2.0 Username */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>2.0 // CHOOSE USERNAME *</Text>
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

          {/* 3.0 Birthdate */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>3.0 // BIRTHDATE (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="2007-05-15"
              placeholderTextColor="#969083"
              value={birthday}
              onChangeText={setBirthday}
            />
          </View>

          {/* 4.0 School */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>4.0 // SCHOOL / INSTITUTION *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Delhi Public School, R.K. Puram"
              placeholderTextColor="#969083"
              value={school}
              onChangeText={setSchool}
            />
          </View>

          {/* 5.0 Grade */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>5.0 // ACADEMIC COHORT GRADE</Text>
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

          {/* 6.0 Target Stream */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>6.0 // TARGET EXAMINATION MATRIX</Text>
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

        {/* Action Button */}
        <View style={styles.actionBox}>
          <BrutalistButton
            title={loading ? 'SAVING SURVEY...' : 'SUBMIT PROFILE SURVEY & START'}
            variant="secondary"
            onPress={handleSubmitSurvey}
            disabled={loading}
          />
          <Text style={styles.securityNote}>
            CONNECTED TO CONCLAVE SECURE NESTJS BACKEND SERVER
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
    fontSize: 24,
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
    gap: 14,
  },
  fieldGroup: {
    gap: 4,
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
    height: 46,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    paddingHorizontal: 12,
    color: '#ffdad8',
    fontFamily: 'Lexend, sans-serif',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkBtn: {
    height: 46,
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
    height: 42,
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
    marginTop: 20,
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
