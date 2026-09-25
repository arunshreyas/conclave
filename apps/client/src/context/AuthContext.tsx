import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: any;
  isSignedIn: boolean;
  isLoaded: boolean;
  loading: boolean;
  hasProfile: boolean | null;
  profile: any;
  backendUnavailable: boolean;
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  isLoaded: false,
  loading: true,
  hasProfile: null,
  profile: null,
  backendUnavailable: false,
  refetch: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const refetch = useCallback(async () => {
    const authenticated = await authService.isAuthenticated();

    if (!authenticated) {
      setUser(null);
      setIsSignedIn(false);
      setIsLoaded(true);
      setHasProfile(false);
      setProfile(null);
      setBackendUnavailable(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userData = await api.getMe();
      setUser(userData);
      setIsSignedIn(true);

      try {
        const profileData = await api.getMyProfile();
        setProfile(profileData);
        setHasProfile(true);
        setBackendUnavailable(false);
      } catch (profileErr: any) {
        if (profileErr?.status === 404) {
          setProfile(null);
          setHasProfile(false);
          setBackendUnavailable(false);
        } else if (profileErr?.status === 401) {
          await authService.clearTokens();
          setUser(null);
          setIsSignedIn(false);
          setProfile(null);
          setHasProfile(false);
        } else {
          setBackendUnavailable(true);
          setHasProfile(null);
        }
      }
    } catch (authErr: any) {
      if (authErr?.status === 401) {
        await authService.clearTokens();
        setUser(null);
        setIsSignedIn(false);
        setProfile(null);
        setHasProfile(false);
      } else {
        setBackendUnavailable(true);
        setIsSignedIn(true);
        setHasProfile(null);
      }
    } finally {
      setIsLoaded(true);
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setIsSignedIn(false);
    setProfile(null);
    setHasProfile(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn,
        isLoaded,
        loading,
        hasProfile,
        profile,
        backendUnavailable,
        refetch,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
