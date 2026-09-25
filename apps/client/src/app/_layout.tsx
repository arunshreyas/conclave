import React, { useEffect } from 'react';
import { DarkTheme, ThemeProvider, Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B0F19',
    card: '#111827',
    text: '#F3F4F6',
    border: '#1F2937',
    primary: '#06B6D4',
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={customDarkTheme}>
        <StatusBar style="light" />
        <RouteGate />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RouteGate() {
  const router = useRouter();
  const segments = useSegments();
  const { isSignedIn, isLoaded, loading, hasProfile, backendUnavailable, refetch } = useAuth();
  
  const firstSegment = segments[0];
  const isAuthRoute = firstSegment === 'welcome' || firstSegment === 'sign-in' || firstSegment === 'sign-up';
  const isOnboardingRoute = firstSegment === 'onboarding';

  useEffect(() => {
    if (!isLoaded || loading) return;

    if (!isSignedIn && !isAuthRoute) {
      router.replace('/welcome');
    } else if (isSignedIn && isAuthRoute) {
      if (hasProfile === false) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isSignedIn && hasProfile === false && !isOnboardingRoute) {
      router.replace('/onboarding');
    } else if (isSignedIn && hasProfile === true && isOnboardingRoute) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, loading, isSignedIn, hasProfile, isAuthRoute, isOnboardingRoute, router]);

  if (isSignedIn && backendUnavailable && !loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.warningText}>Could not reach Crack backend. Check your connection and try again.</Text>
        <Text onPress={() => void refetch()} style={[styles.warningText, styles.retry]}>RETRY</Text>
      </View>
    );
  }

  if (!isLoaded || (isSignedIn && (loading || hasProfile === null))) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f2bf4b" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#310004' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="create-profile" options={{ headerShown: false }} />
      <Stack.Screen name="rapid-fire" options={{ headerShown: false }} />
      <Stack.Screen name="paper-exam" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="test" options={{ headerShown: false }} />
      <Stack.Screen name="ai-review" options={{ headerShown: false }} />
      <Stack.Screen name="crackr" options={{ headerShown: false }} />
      <Stack.Screen name="sahara" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#310004',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  warningText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
    color: '#f2bf4b',
    textAlign: 'center',
  },
  retry: { marginTop: 20, padding: 12 },
});
