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

  // Checks, Error Banners & Loading State
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Username Validation Check
  const handleCheckUsername = async () => {
    setErrorMsg(null);
    const username = userName.trim();
    if (!username) {
      setErrorMsg('Please enter a username to check availability.');
      return;
    }
    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      setErrorMsg('Username can only contain letters, numbers, and underscores (3-24 chars).');
      return;
    }

    setCheckingUsername(true);
    try {
      const res = await authenticatedApi.checkUsername(username);
      setUsernameAvailable(res.available);
      if (!res.available) {
        setErrorMsg('Username is already taken. Please choose another.');
      }
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Step 1 Validation
  const handleGoToAcademics = () => {
    setErrorMsg(null);
    const profileName = name.trim();
    const profileUsername = userName.trim();

    if (!profileName) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }
    if (profileName.length < 2) {
      setErrorMsg('Name must be at least 2 characters long.');
      return;
    }
    if (!profileUsername) {
      setErrorMsg('Please choose a Username.');
      return;
    }
    if (profileUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(profileUsername)) {
      setErrorMsg('Username can only contain letters, numbers, and underscores.');
      return;
    }
    setCurrentStep(1);
  };

  // Step 2 Validation
  const handleGoToReview = () => {
    setErrorMsg(null);
    if (!school.trim()) {
      setErrorMsg('Please enter your School or Institution name.');
      return;
    }
    setCurrentStep(2);
  };

  // Final Submit Action
  const handleSubmitProfile = async () => {
    setErrorMsg(null);
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
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
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
        <BrutalistBadge label="JWT SECURED // CRACKR" variant="gold" />
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

        {errorMsg && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        {/* STEP 0: PERSONAL IDENTITY */}
        {currentStep === 0 && (
          <View style={styles.stepContent}>
            <View style={styles.heroSection}>
              <BrutalistBadge label="PHASE 01 // IDENTITY" variant="live" />
              <Text style={styles.heroTitle}>CREATE YOUR IDENTITY</Text>
              <Text style={styles.heroSubtitle}>
                Set up your student profile name and unique username to access Crackr JEE mock tests and voice tools.
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
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={(txt) => {
                    setName(txt);
                    if (errorMsg) setErrorMsg(null);
                  }}
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
                        { color: usernameAvailable ? '#10B981' : '#EF4444' },
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
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    value={userName}
                    onChangeText={(text) => {
                      setUserName(text);
                      setUsernameAvailable(null);
                      if (errorMsg) setErrorMsg(null);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={handleCheckUsername}
                    disabled={checkingUsername}
                  >
                    {checkingUsername ? (
                      <ActivityIndicator size="small" color="#06B6D4" />
                    ) : (
                      <Text style={styles.checkBtnText}>CHECK</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.hintText}>
                  At least 3 characters. Letters, numbers, and underscores only.
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
                  placeholderTextColor="#94A3B8"
                  value={school}
                  onChangeText={(txt) => {
                    setSchool(txt);
                    if (errorMsg) setErrorMsg(null);
                  }}
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
                  placeholderTextColor="#94A3B8"
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
                Review your official Crackr Student Access Pass before activating your personalized JEE portal.
              </Text>
            </View>

            {/* Official Student Pass Display */}
            <BrutalistCard highlight style={styles.studentPassCard}>
              <View style={styles.passHeader}>
                <View style={styles.passChipDot} />
                <Text style={styles.passHeaderTitle}>CRACKR STUDENT ACCESS PASS</Text>
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
                <Text style={styles.passFooterText}>JWT AUTHENTICATED • CRACKR EDITION 2026</Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  stepperContainer: {
    marginBottom: 16,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepTitleLabel: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#06B6D4',
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  stepCounterText: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#F3F4F6',
    fontWeight: '800',
  },
  stepperTrack: {
    height: 6,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stepperFill: {
    height: '100%',
    backgroundColor: '#06B6D4',
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
  stepContent: {
    gap: 16,
  },
  heroSection: {
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    color: '#F3F4F6',
    marginVertical: 6,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  avatarPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#111827',
    borderRadius: 12,
    gap: 14,
  },
  avatarBox: {
    width: 56,
    height: 56,
    backgroundColor: '#06B6D4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '900',
    color: '#0B0F19',
  },
  avatarMeta: {
    flex: 1,
  },
  avatarMetaTag: {
    fontFamily: 'System',
    fontSize: 9,
    color: '#06B6D4',
    letterSpacing: 1,
    fontWeight: '800',
  },
  avatarName: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '800',
    color: '#F3F4F6',
    marginTop: 2,
  },
  avatarUsername: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#94A3B8',
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
    fontFamily: 'System',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  statusText: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '800',
  },
  hintText: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnText: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#06B6D4',
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B0F19',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  chipActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  chipText: {
    fontFamily: 'System',
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#0B0F19',
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
    padding: 18,
    backgroundColor: '#111827',
    borderColor: '#06B6D4',
    borderWidth: 2,
    borderRadius: 16,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 16,
  },
  passChipDot: {
    width: 10,
    height: 10,
    backgroundColor: '#06B6D4',
    borderRadius: 5,
  },
  passHeaderTitle: {
    fontFamily: 'System',
    fontSize: 11,
    color: '#F3F4F6',
    fontWeight: '800',
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
    backgroundColor: '#06B6D4',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passAvatarText: {
    fontFamily: 'System',
    fontSize: 26,
    fontWeight: '900',
    color: '#0B0F19',
  },
  passDetails: {
    flex: 1,
  },
  passName: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '900',
    color: '#F3F4F6',
  },
  passUsername: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#06B6D4',
    marginTop: 2,
    fontWeight: '700',
  },
  passDivider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginVertical: 8,
  },
  passMetaText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  passFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#1F2937',
    alignItems: 'center',
  },
  passFooterText: {
    fontFamily: 'System',
    fontSize: 9,
    color: '#64748B',
    letterSpacing: 1,
    fontWeight: '700',
  },
});
