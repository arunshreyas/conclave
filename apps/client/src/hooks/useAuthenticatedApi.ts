import { useMemo } from 'react';
import { api } from '@/services/api';

export function useAuthenticatedApi() {
  return useMemo(() => ({
    getMyProfile: () => api.getMyProfile(),
    checkUsername: (username: string) => api.checkUsername(username),
    createProfile: (payload: Parameters<typeof api.createProfile>[0]) => api.createProfile(payload),
    updateMyProfile: (payload: Parameters<typeof api.updateMyProfile>[0]) => api.updateMyProfile(payload),
  }), []);
}
