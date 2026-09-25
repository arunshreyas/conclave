import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignUp = async () => {
    setErrorMsg(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.register(trimmedEmail, password);
      await refetch();
    } catch (err: any) {
      setErrorMsg(err.message || 'Email is already taken. Please sign in instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <BrutalistBadge label="CRACKR // REGISTRATION" variant="gold" />
        <Text style={styles.topBarTitle}>NEW STUDENT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBox}>
          <BrutalistBadge label="PHASE 00 // REGISTRATION" variant="live" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>JOIN CRACKR</Text>
          <Text style={styles.subtitle}>
            Create your account credentials to begin your JEE Advanced preparation.
          </Text>
        </View>

        {errorMsg && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        <BrutalistCard highlight style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>1.0 // EMAIL ADDRESS *</Text>
            <TextInput
              style={styles.input}
              placeholder="student@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (errorMsg) setErrorMsg(null);
              }}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>2.0 // PASSWORD * (MIN 6 CHARACTERS)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errorMsg) setErrorMsg(null);
              }}
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
          <Text style={styles.footerText}>ALREADY HAVE A CRACKR ACCOUNT?</Text>
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
    backgroundColor: '#0B0F19',
  },
  topBar: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
  },
  topBarTitle: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#06B6D4',
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
  },
  headerBox: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '900',
    color: '#F3F4F6',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 20,
  },
  errorBanner: {
    padding: 12,
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#FECACA',
    fontWeight: '700',
  },
  card: {
    padding: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B0F19',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#F3F4F6',
    fontFamily: 'System',
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
    fontFamily: 'System',
    fontSize: 11,
    color: '#94A3B8',
  },
  linkText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '800',
    letterSpacing: 1,
  },
});
