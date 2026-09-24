import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistButton, BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';
import { useGoogleOAuth } from '@/hooks/useGoogleOAuth';

const slides = [
  {
    num: '01',
    module: 'VOICE ENGINE',
    subtitle: 'STT DICTATION MATRIX',
    title: 'VOICE-ENABLED JEE PRACTICE FOR DYSLEXIA & FOCUS.',
    desc: 'High-yield Physics, Chemistry, and Mathematics practice with natural speech-to-text input, adaptive dyslexia fonts, and zero-distraction layout.',
  },
  {
    num: '02',
    module: 'ACCESSIBILITY',
    subtitle: 'OPENDYSLEXIC & COGNITIVE RE-FLOW',
    title: 'ACCESSIBLE TESTING FOR EVERY LEARNER.',
    desc: 'Customize typography spacing, high-contrast brutalist borders, and speech synthesis rates tailored for neurodivergent focus.',
  },
  {
    num: '03',
    module: 'SAHARA AI',
    subtitle: 'CONCEPT MASTERY & REASONING',
    title: 'INSTANT STEP-BY-STEP PROBLEM DECONSTRUCTION.',
    desc: 'Never stay stuck. Get instant AI voice hints, trap alerts, and personalized problem sets targeted for IIT-JEE top ranks.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { handleGoogleAuth } = useGoogleOAuth();

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Meta Bar */}
        <View style={styles.topBar}>
          <View style={styles.editionTag}>
            <View style={styles.squareDot} />
            <Text style={styles.editionText}>EDITION 2025</Text>
          </View>
          <Text style={styles.stepCounter}>0{currentSlide + 1} / 03</Text>
        </View>

        {/* Wordmark Header */}
        <View style={styles.headerBox}>
          <Text style={styles.wordmark}>CRACKR</Text>
        </View>

        {/* Center Stage Presentation */}
        <View style={styles.mainStage}>
          {/* Numerals Split Box */}
          <View style={styles.splitBox}>
            <View style={styles.numeralBox}>
              <Text style={styles.numeralText}>{slide.num}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.moduleTag}>{slide.module}</Text>
              <Text style={styles.specTitle}>{slide.module}</Text>
              <Text style={styles.specSubtitle}>{slide.subtitle}</Text>
            </View>
          </View>

          {/* Main Headline */}
          <Text style={styles.headline}>{slide.title}</Text>
          <View style={styles.hairlineAccent} />
          <Text style={styles.descText}>{slide.desc}</Text>

          {/* Carousel Progress Indicators */}
          <View style={styles.carouselTracker}>
            <View style={styles.trackerHeader}>
              <Text style={styles.trackerLabel}>CAROUSEL STEP</Text>
              <Text style={styles.trackerStage}>STAGE 0{currentSlide + 1}</Text>
            </View>
            <View style={styles.trackerBars}>
              {slides.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentSlide(index)}
                  style={[
                    styles.trackerBar,
                    index === currentSlide ? styles.trackerBarActive : styles.trackerBarInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Authentication Access Dock Card */}
          <BrutalistCard highlight style={styles.authCard}>
            <BrutalistBadge label="CLERK AUTH // GOOGLE OAUTH MATRIX" variant="gold" />
            <Text style={styles.authCardTitle}>AUTHENTICATION PORTAL</Text>
            <Text style={styles.authCardSub}>
              Sign in with your Google account via Clerk to initialize or sync your student profile matrix.
            </Text>

            <View style={styles.authBtnGroup}>
              {/* Google OAuth Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.googleBtn}
                onPress={handleGoogleAuth}
              >
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>CONTINUE WITH GOOGLE</Text>
              </TouchableOpacity>

              <BrutalistButton
                title="REGISTER NEW STUDENT PROFILE"
                variant="primary"
                onPress={() => router.push('/sign-up')}
              />
              <BrutalistButton
                title="PREVIEW HOME DASHBOARD"
                variant="outline"
                onPress={() => router.push('/(tabs)')}
              />
            </View>
          </BrutalistCard>
        </View>
      </ScrollView>

      {/* Bottom Action Dock */}
      <View style={styles.footerDock}>
        <Text style={styles.footerNotice}>ACCESSIBILITY-FIRST ARCHITECTURE • CLERK SECURED</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#310004',
  },
  scrollContent: {
    paddingBottom: 20,
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
  editionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  squareDot: {
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
  },
  editionText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffffff',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  stepCounter: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#f2bf4b',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  headerBox: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#130f16',
  },
  wordmark: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 48,
    fontWeight: '900',
    color: '#ffdad8',
    letterSpacing: -1,
  },
  mainStage: {
    padding: 16,
  },
  splitBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 20,
  },
  numeralBox: {
    width: 90,
    backgroundColor: '#1a141f',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#4b463b',
    paddingVertical: 12,
  },
  numeralText: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
  },
  specBox: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#310004',
  },
  moduleTag: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    letterSpacing: 1,
  },
  specTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 2,
  },
  specSubtitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#cdc6b7',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  headline: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#ffdad8',
    lineHeight: 28,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  hairlineAccent: {
    width: 48,
    height: 2,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  descText: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 14,
    color: '#cdc6b7',
    lineHeight: 22,
    marginBottom: 16,
  },
  carouselTracker: {
    marginTop: 4,
    marginBottom: 20,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  trackerLabel: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    letterSpacing: 1,
  },
  trackerStage: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 1,
  },
  trackerBars: {
    flexDirection: 'row',
    gap: 8,
  },
  trackerBar: {
    flex: 1,
    height: 8,
  },
  trackerBarActive: {
    backgroundColor: '#ffffff',
  },
  trackerBarInactive: {
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: 'transparent',
  },
  authCard: {
    marginTop: 12,
    padding: 16,
  },
  authCardTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 20,
    fontWeight: '900',
    color: '#ffdad8',
    marginVertical: 6,
  },
  authCardSub: {
    fontFamily: 'Lexend, sans-serif',
    fontSize: 12,
    color: '#cdc6b7',
    marginBottom: 14,
    lineHeight: 18,
  },
  authBtnGroup: {
    gap: 10,
  },
  googleBtn: {
    height: 52,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f2bf4b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#4b463b',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 3,
  },
  googleIcon: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 13,
    fontWeight: '800',
    color: '#130f16',
    letterSpacing: 1.2,
  },
  footerDock: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#130f16',
  },
  footerNotice: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});
