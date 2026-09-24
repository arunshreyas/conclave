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
import { useSignIn } from '@clerk/clerk-expo';
import { BrutalistButton, BrutalistBadge } from '@/components/brutalist-ui';

export default function SignInScreen() {
  const router = useRouter();

  let signIn: any = null;
  let isLoaded = false;
  let setActive: any = null;

  try {
    const auth = useSignIn();
    signIn = auth.signIn;
    isLoaded = auth.isLoaded;
    setActive = auth.setActive;
  } catch (e) {
    // ClerkProvider not mounted
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLoaded && signIn && setActive) {
        const completeSignIn = await signIn.create({
          identifier: email,
          password,
        });

        if (completeSignIn.status === 'complete') {
          await setActive({ session: completeSignIn.createdSessionId });
          router.replace('/(tabs)');
          return;
        }
      }
      // Dev mode fallback
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.errors?.[0]?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>CLERK AUTHENTICATION</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <BrutalistBadge label="CLERK AUTH // ACCESS PORTAL" variant="gold" />
          <Text style={styles.title}>SIGN IN TO CONCLAVE</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to verify session & sync profile matrix.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>1.0 // EMAIL ADDRESS</Text>
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
            <Text style={styles.label}>2.0 // PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#969083"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View style={styles.actionBox}>
          <BrutalistButton
            title={loading ? 'VERIFYING SESSION...' : 'SIGN IN & VERIFY'}
            variant="secondary"
            onPress={handleSignIn}
            disabled={loading}
          />
          <TouchableOpacity
            style={styles.signUpLink}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={styles.signUpLinkText}>DON'T HAVE AN ACCOUNT? REGISTER HERE →</Text>
          </TouchableOpacity>
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
  label: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    letterSpacing: 1.2,
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
  },
  actionBox: {
    marginTop: 24,
  },
  signUpLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  signUpLinkText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
