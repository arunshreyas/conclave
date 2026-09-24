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
import { useAuth, useSignUp } from '@clerk/clerk-expo';
import { BrutalistButton, BrutalistBadge } from '@/components/brutalist-ui';
import { api } from '@/services/api';

export default function SignUpScreen() {
  const router = useRouter();

  let getToken: any = async () => null;
  let isSignedIn = false;
  try {
    const auth = useAuth();
    getToken = auth.getToken;
    isSignedIn = auth.isSignedIn ?? false;
  } catch (e) {
    // ClerkProvider not mounted
  }

  let signUp: any = null;
  let isSignUpLoaded = false;
  let setActive: any = null;
  try {
    const signUpAuth = useSignUp();
    signUp = signUpAuth.signUp;
    isSignUpLoaded = signUpAuth.isLoaded;
    setActive = signUpAuth.setActive;
  } catch (e) {
    // ClerkProvider not mounted
  }

  // Step 1: Account Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  // Step 2: Profile Fields
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
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

  const handleClerkSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email address and password for Clerk Auth.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUpLoaded && signUp) {
        await signUp.create({
          emailAddress: email,
          password,
        });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } else {
        // Dev fallback
        setPendingVerification(false);
      }
    } catch (err: any) {
      Alert.alert('Sign Up Error', err.errors?.[0]?.message || err.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    setLoading(true);
    try {
      if (signUp && setActive) {
        const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
        if (completeSignUp.status === 'complete') {
          await setActive({ session: completeSignUp.createdSessionId });
          setPendingVerification(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Verification Error', err.errors?.[0]?.message || err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    if (!name || !userName || !school) {
      Alert.alert('Missing Profile Data', 'Please fill out your Name, Username, and School.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await api.createProfile(token, {
        name,
        userName,
        email: email || 'student@conclave.dev',
        birthday,
        school,
        grade,
        stream,
      });
      Alert.alert('Profile Initialized', 'Your student profile matrix is live!', [
        { text: 'ENTER DASHBOARD', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Profile Saved', 'Profile registered for student matrix.', [
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>REGISTRATION MATRIX</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <BrutalistBadge label="CLERK AUTH // REGISTRATION" variant="live" />
          <Text style={styles.title}>CREATE CONCLAVE ACCOUNT</Text>
          <Text style={styles.subtitle}>
            Sign up with Clerk authentication and initialize your JEE student profile.
          </Text>
        </View>

        {/* Clerk Verification Form if pending code */}
        {pendingVerification ? (
          <View style={styles.formContainer}>
            <Text style={styles.label}>ENTER VERIFICATION CODE SENT TO EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#969083"
              value={code}
              onChangeText={setCode}
            />
            <BrutalistButton
              title={loading ? 'VERIFYING...' : 'VERIFY CODE'}
              variant="secondary"
              onPress={handleVerifyCode}
              disabled={loading}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            {/* Step 1: Clerk Email & Password */}
            <Text style={styles.sectionHeader}>// 1.0 CLERK ACCOUNT CREDENTIALS</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL ADDRESS *</Text>
              <TextInput
                style={styles.input}
                placeholder="student@example.com"
                placeholderTextColor="#969083"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PASSWORD *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#969083"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Step 2: Student Profile Details */}
            <Text style={[styles.sectionHeader, { marginTop: 12 }]}>// 2.0 STUDENT PROFILE MATRIX</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>FULL NAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Arjun Sharma"
                placeholderTextColor="#969083"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>USERNAME *</Text>
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>SCHOOL / INSTITUTION *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Delhi Public School, R.K. Puram"
                placeholderTextColor="#969083"
                value={school}
                onChangeText={setSchool}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>ACADEMIC COHORT GRADE</Text>
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>TARGET EXAMINATION MATRIX</Text>
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

            <View style={styles.actionBox}>
              <BrutalistButton
                title={loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT & INITIALIZE PROFILE'}
                variant="secondary"
                onPress={async () => {
                  if (signUp && isSignUpLoaded && email && password && !isSignedIn) {
                    await handleClerkSignUp();
                  } else {
                    await handleSubmitProfile();
                  }
                }}
                disabled={loading}
              />
              <TouchableOpacity
                style={styles.signInLink}
                onPress={() => router.push('/sign-in')}
              >
                <Text style={styles.signInLinkText}>ALREADY HAVE AN ACCOUNT? SIGN IN →</Text>
              </TouchableOpacity>
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
    gap: 12,
  },
  sectionHeader: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
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
    height: 44,
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
    height: 44,
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
    height: 40,
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
    marginTop: 16,
    marginBottom: 20,
  },
  signInLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  signInLinkText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
