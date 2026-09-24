import React from 'react';
import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@/utils/tokenCache';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const isValidClerkKey = Boolean(
  publishableKey &&
  (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_')) &&
  publishableKey.length > 30 &&
  !publishableKey.includes('dummy')
);

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#310004',
    card: '#310004',
    text: '#ffdad8',
    border: '#4b463b',
    primary: '#ffffff',
  },
};

export default function RootLayout() {
  const content = (
    <ThemeProvider value={customDarkTheme}>
      <StatusBar style="light" />
      {!isValidClerkKey && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ CLERK AUTH NOTICE: Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env
          </Text>
        </View>
      )}
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
        <Stack.Screen name="test" options={{ headerShown: false }} />
        <Stack.Screen name="ai-review" options={{ headerShown: false }} />
        <Stack.Screen name="crackr" options={{ headerShown: false }} />
        <Stack.Screen name="sahara" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );

  if (isValidClerkKey && publishableKey) {
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        {content}
      </ClerkProvider>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  warningBanner: {
    backgroundColor: '#5c010e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#f2bf4b',
    alignItems: 'center',
    zIndex: 999,
  },
  warningText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
    textAlign: 'center',
  },
});
