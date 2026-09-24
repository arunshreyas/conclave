import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

export function useGoogleOAuth() {
  let startOAuthFlow: any = null;
  try {
    const oauth = useOAuth({ strategy: 'oauth_google' });
    startOAuthFlow = oauth.startOAuthFlow;
  } catch (e) {
    // ClerkProvider not mounted
  }

  const handleGoogleAuth = useCallback(async () => {
    if (!startOAuthFlow) return;
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('OAuth error', err);
    }
  }, [startOAuthFlow]);

  return { handleGoogleAuth };
}
