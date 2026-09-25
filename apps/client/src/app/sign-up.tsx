import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';

export default function SignUpScreen() {
  const router = useRouter();
  const { refetch } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing Info', 'Please enter your email address and password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.register(trimmedEmail, password);
      await refetch();
      // On success, refetch() sets isSignedIn=true & hasProfile=false, triggering automatic redirect to /onboarding
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <BrutalistBadge label="CONCLAVE // REGISTRATION" variant="gold" />
        <Text style={styles.topBarTitle}>NEW STUDENT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBox}>
          <BrutalistBadge label="PHASE 00 // REGISTRATION" variant="live" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>JOIN CONCLAVE</Text>
          <Text style={styles.subtitle}>
            Create your account credentials to begin your JEE Advanced preparation journey.
          </Text>
        </View>

        <BrutalistCard highlight style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>1.0 // EMAIL ADDRESS *</Text>
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
            <Text style={styles.label}>2.0 // PASSWORD * (MIN 6 CHARACTERS)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#969083"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.actionBox}>
            <BrutalistButton
              title={loading ? 'CREATING ACCOUNT...' : 'REGISTER & GO TO PROFILE →'}
              variant="secondary"
              onPress={handleSignUp}
              disabled={loading}
            />
          </View>
        </BrutalistCard>

        <View style={styles.footerLinkBox}>
          <Text style={styles.footerText}>ALREADY HAVE A CONCLAVE ACCOUNT?</Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={styles.linkText}>SIGN IN TO PORTAL →</Text>
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
    backgroundColor: '#130f16',
  },
  topBarTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  headerBox: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 28,
    fontWeight: '900',
    color: '#ffdad8',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#cdc6b7',
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    padding: 20,
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
    paddingHorizontal: 14,
    color: '#ffdad8',
    fontFamily: 'Lexend, sans-serif',
    fontSize: 14,
  },
  actionBox: {
    marginTop: 8,
  },
  footerLinkBox: {
    marginTop: 24,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#cdc6b7',
  },
  linkText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#f2bf4b',
    fontWeight: '800',
    letterSpacing: 1,
  },
});
