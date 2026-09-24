import React from 'react';
import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@/utils/tokenCache';
import { StatusBar } from 'expo-status-bar';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dummy_key_for_development';

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
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={customDarkTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#310004' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="test" options={{ headerShown: false }} />
          <Stack.Screen name="ai-review" options={{ headerShown: false }} />
          <Stack.Screen name="crackr" options={{ headerShown: false }} />
          <Stack.Screen name="sahara" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </ClerkProvider>
  );
}
