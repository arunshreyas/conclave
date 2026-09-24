import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { api } from '@/services/api';

export function useAuthStatus() {
  const { isSignedIn, isLoaded, getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [clerkUser, setClerkUser] = useState<any>(null);

  const refetch = async () => {
    if (!isSignedIn) {
      setHasProfile(false);
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      if (token) {
        const res = await api.getAuthStatus(token);
        setHasProfile(res?.hasProfile ?? false);
        setProfile(res?.profile ?? null);
        setClerkUser(res?.clerkUser ?? null);
      }
    } catch (err) {
      console.error('Error fetching auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      refetch();
    }
  }, [isSignedIn, isLoaded, userId]);

  return { isSignedIn, isLoaded, loading, hasProfile, profile, clerkUser, refetch };
}
