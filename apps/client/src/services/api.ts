import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();

export interface UserProfileData {
  name: string;
  userName: string;
  email: string;
  birthday: string;
  school: string;
  grade: string;
  stream: string;
}

export const api = {
  async getAuthStatus(token: string | null) {
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch auth status');
    return res.json();
  },

  async createProfile(token: string | null, data: UserProfileData) {
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${API_BASE_URL}/user-profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create profile');
    }
    return res.json();
  },

  async checkUsername(username: string) {
    const res = await fetch(`${API_BASE_URL}/user-profile/check-username/${username}`);
    if (!res.ok) return { available: false };
    return res.json();
  },
};
