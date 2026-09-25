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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useAuthStatus } from '@/hooks/useAuthStatus';

export default function OnboardingScreen() {
  const router = useRouter();
  const authenticatedApi = useAuthenticatedApi();
  const { refetch } = useAuthStatus();

  // Multi-step state (Step 0: Identity, Step 1: Academics, Step 2: Confirmation Card)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Form Fields
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [birthday, setBirthday] = useState('2007-05-15');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('12th');
  const [stream, setStream] = useState('JEE Advanced');

  // Checks & Loading State
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live Username Validation Check
  const handleCheckUsername = async () => {
    const username = userName.trim();
    if (!username) {
      Alert.alert('Missing Username', 'Please enter a username to check availability.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      Alert.alert('Invalid Format', 'Username must be 3-24 characters (letters, numbers, underscores).');
      return;
    }

    setCheckingUsername(true);
    try {
      const res = await authenticatedApi.checkUsername(username);
      setUsernameAvailable(res.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Step 1 Validation
  const handleGoToAcademics = () => {
    const profileName = name.trim();
    const profileUsername = userName.trim();

    if (!profileName) {
      Alert.alert('Required Field', 'Please enter your Full Name.');
      return;
    }
    if (!profileUsername) {
      Alert.alert('Required Field', 'Please enter a Username.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(profileUsername)) {
      Alert.alert('Invalid Username', 'Username must be 3-24 alphanumeric characters or underscores.');
      return;
    }
    setCurrentStep(1);
  };

  // Step 2 Validation
  const handleGoToReview = () => {
    if (!school.trim()) {
      Alert.alert('Required Field', 'Please enter your School or Institution name.');
      return;
    }
    setCurrentStep(2);
  };

  // Final Submit Action
  const handleSubmitProfile = async () => {
    const profileName = name.trim();
    const profileUsername = userName.trim();

    setLoading(true);
    try {
      await authenticatedApi.createProfile({
        name: profileName,
        userName: profileUsername,
        birthday: birthday.trim() || undefined,
        school: school.trim(),
        grade,
        stream,
      });

      await refetch();
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err?.status === 401) return;
      const msg = err?.data?.message || err?.message || 'Failed to create student profile.';
      Alert.alert('Profile Creation Failed', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  // Generate Initials Avatar Badge
  const initials = name.trim()
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'CC';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Dock */}
      <View style={styles.topBar}>
        <BrutalistBadge label="JWT SECURED // CONCLAVE" variant="gold" />
        <Text style={styles.topBarTitle}>STUDENT ONBOARDING</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Step Progress Bar */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperHeader}>
            <Text style={styles.stepTitleLabel}>
              STEP 0{currentStep + 1} // {currentStep === 0 ? 'PERSONAL IDENTITY' : currentStep === 1 ? 'ACADEMIC PROFILE' : 'STUDENT CARD CONFIRMATION'}
            </Text>
            <Text style={styles.stepCounterText}>0{currentStep + 1} / 03</Text>
          </View>
          <View style={styles.stepperTrack}>
            <View
              style={[
                styles.stepperFill,
                { width: currentStep === 0 ? '33%' : currentStep === 1 ? '66%' : '100%' },
              ]}
            />
          </View>
        </View>

        {/* STEP 0: PERSONAL IDENTITY */}
        {currentStep === 0 && (
          <View style={styles.stepContent}>
            <View style={styles.heroSection}>
              <BrutalistBadge label="PHASE 01 // IDENTITY" variant="live" />
              <Text style={styles.heroTitle}>CREATE YOUR IDENTITY</Text>
              <Text style={styles.heroSubtitle}>
                Set up your student profile name and unique username to access Crack JEE mock tests and voice dictation tools.
              </Text>
            </View>

            {/* Avatar Preview Box */}
            <View style={styles.avatarPreviewRow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.avatarMeta}>
                <Text style={styles.avatarMetaTag}>STUDENT BADGE PREVIEW</Text>
                <Text style={styles.avatarName}>{name.trim() || 'Your Full Name'}</Text>
                <Text style={styles.avatarUsername}>
                  @{userName.trim() ? userName.trim().toLowerCase() : 'username'}
                </Text>
              </View>
            </View>

            <BrutalistCard highlight style={styles.cardForm}>
              {/* Full Name Input */}
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

              {/* Username Input with Live Availability Check */}
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
                      {usernameAvailable ? '[AVAILABLE ✓]' : '[TAKEN ✗]'}
                    </Text>
                  )}
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="e.g. arjun_jee25"
                    placeholderTextColor="#969083"
                    autoCapitalize="none"
                    value={userName}
                    onChangeText={(text) => {
                      setUserName(text);
                      setUsernameAvailable(null);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={handleCheckUsername}
                    disabled={checkingUsername}
                  >
                    {checkingUsername ? (
                      <ActivityIndicator size="small" color="#f2bf4b" />
                    ) : (
                      <Text style={styles.checkBtnText}>CHECK</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.hintText}>
                  3-24 characters. Letters, numbers, and underscores only.
                </Text>
              </View>
            </BrutalistCard>

            <View style={styles.actionDock}>
              <BrutalistButton
                title="NEXT: ACADEMIC DETAILS →"
                variant="secondary"
                onPress={handleGoToAcademics}
              />
            </View>
          </View>
        )}

        {/* STEP 1: ACADEMIC DETAILS */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.heroSection}>
              <BrutalistBadge label="PHASE 02 // ACADEMICS" variant="live" />
              <Text style={styles.heroTitle}>ACADEMIC MATRIX</Text>
              <Text style={styles.heroSubtitle}>
                Tell us about your institution, current class cohort, and target exam matrix so we can personalize your problem sets.
              </Text>
            </View>

            <BrutalistCard highlight style={styles.cardForm}>
              {/* School Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>3.0 // SCHOOL / INSTITUTION *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delhi Public School, R.K. Puram"
                  placeholderTextColor="#969083"
                  value={school}
                  onChangeText={setSchool}
                />
              </View>

              {/* Grade Chips */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>4.0 // ACADEMIC COHORT GRADE</Text>
                <View style={styles.chipRow}>
                  {['11th', '12th', 'Dropper'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGrade(g)}
                      style={[styles.chip, grade === g && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, grade === g && styles.chipTextActive]}>
                        {g === 'Dropper' ? 'DROPPER / REPEATER' : `${g} CLASS`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Stream Target Chips */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>5.0 // TARGET EXAMINATION</Text>
                <View style={styles.chipRow}>
                  {['JEE Main', 'JEE Advanced'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setStream(s)}
                      style={[styles.chip, stream === s && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, stream === s && styles.chipTextActive]}>
                        {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Optional Birthdate Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>6.0 // BIRTHDATE (OPTIONAL: YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2007-05-15"
                  placeholderTextColor="#969083"
                  value={birthday}
                  onChangeText={setBirthday}
                />
              </View>
            </BrutalistCard>

            <View style={styles.actionDockGroup}>
              <BrutalistButton
                title="← BACK"
                variant="outline"
                onPress={() => setCurrentStep(0)}
                style={{ flex: 1 }}
              />
              <BrutalistButton
                title="PREVIEW STUDENT CARD →"
                variant="secondary"
                onPress={handleGoToReview}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}

        {/* STEP 2: CONFIRMATION CARD */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.heroSection}>
              <BrutalistBadge label="PHASE 03 // LAUNCH PASS" variant="live" />
              <Text style={styles.heroTitle}>CONFIRM STUDENT CARD</Text>
              <Text style={styles.heroSubtitle}>
                Review your official Crack Student Access Pass before activating your personalized JEE portal.
              </Text>
            </View>

            {/* Official Student Pass Brutalist Display */}
            <BrutalistCard highlight style={styles.studentPassCard}>
              <View style={styles.passHeader}>
                <View style={styles.passChipDot} />
                <Text style={styles.passHeaderTitle}>CRACK STUDENT ACCESS PASS</Text>
                <BrutalistBadge label="VERIFIED" variant="gold" />
              </View>

              <View style={styles.passBody}>
                <View style={styles.passAvatarBox}>
                  <Text style={styles.passAvatarText}>{initials}</Text>
                </View>
                <View style={styles.passDetails}>
                  <Text style={styles.passName}>{name}</Text>
                  <Text style={styles.passUsername}>@{userName.toLowerCase()}</Text>
                  <View style={styles.passDivider} />
                  <Text style={styles.passMetaText}>INSTITUTION: {school}</Text>
                  <Text style={styles.passMetaText}>COHORT: {grade} Grade</Text>
                  <Text style={styles.passMetaText}>TARGET MATRIX: {stream}</Text>
                </View>
              </View>

              <View style={styles.passFooter}>
                <Text style={styles.passFooterText}>JWT AUTHENTICATED • CONCLAVE EDITION 2025</Text>
              </View>
            </BrutalistCard>

            <View style={styles.actionDock}>
              <BrutalistButton
                title={loading ? 'INITIALIZING PORTAL...' : 'CONFIRM & LAUNCH PORTAL ✓'}
                variant="secondary"
                onPress={handleSubmitProfile}
                disabled={loading}
              />
              <BrutalistButton
                title="← EDIT DETAILS"
                variant="outline"
                onPress={() => setCurrentStep(1)}
                disabled={loading}
              />
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
    padding: 16,
    paddingBottom: 32,
  },
  stepperContainer: {
    marginBottom: 20,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepTitleLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  stepCounterText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  stepperTrack: {
    height: 6,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
  },
  stepperFill: {
    height: '100%',
    backgroundColor: '#f2bf4b',
  },
  stepContent: {
    gap: 16,
  },
  heroSection: {
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 24,
    fontWeight: '900',
    color: '#ffdad8',
    marginVertical: 8,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 13,
    color: '#cdc6b7',
    lineHeight: 20,
  },
  avatarPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    gap: 14,
  },
  avatarBox: {
    width: 56,
    height: 56,
    backgroundColor: '#f2bf4b',
    borderWidth: 1,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 22,
    fontWeight: '900',
    color: '#130f16',
  },
  avatarMeta: {
    flex: 1,
  },
  avatarMetaTag: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#f2bf4b',
    letterSpacing: 1,
    fontWeight: '700',
  },
  avatarName: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#ffdad8',
    marginTop: 2,
  },
  avatarUsername: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#cdc6b7',
  },
  cardForm: {
    padding: 16,
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
  hintText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 11,
    color: '#969083',
    marginTop: 2,
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
    paddingHorizontal: 4,
  },
  chipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  chipText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    fontWeight: '700',
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#130f16',
  },
  actionDock: {
    marginTop: 12,
    gap: 10,
  },
  actionDockGroup: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  studentPassCard: {
    padding: 16,
    backgroundColor: '#1a141f',
    borderColor: '#f2bf4b',
    borderWidth: 2,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 16,
  },
  passChipDot: {
    width: 10,
    height: 10,
    backgroundColor: '#f2bf4b',
  },
  passHeaderTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  passBody: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  passAvatarBox: {
    width: 64,
    height: 64,
    backgroundColor: '#f2bf4b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  passAvatarText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 26,
    fontWeight: '900',
    color: '#130f16',
  },
  passDetails: {
    flex: 1,
  },
  passName: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    color: '#ffdad8',
  },
  passUsername: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#f2bf4b',
    marginTop: 2,
  },
  passDivider: {
    height: 1,
    backgroundColor: '#4b463b',
    marginVertical: 8,
  },
  passMetaText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#cdc6b7',
    marginTop: 2,
  },
  passFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  passFooterText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#969083',
    letterSpacing: 1,
  },
});
