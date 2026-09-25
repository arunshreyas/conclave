import { Platform } from 'react-native';
import { authService } from './auth.service';

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

export interface CreateUserProfilePayload {
  name: string;
  userName: string;
  birthday?: string;
  school: string;
  grade: string;
  stream: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  userName?: string;
  birthday?: string;
  school?: string;
  grade?: string;
  stream?: string;
}

export const api = {
  async fetchWithAuth(
    endpoint: string,
    options: RequestInit = {},
  ) {
    const token = await authService.getAccessToken();
    if (!token) {
      const error = new Error('Your session has expired. Please sign in again.') as Error & { status: number };
      error.status = 401;
      throw error;
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const rawMsg = errorData.message;
      const message = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : rawMsg || `HTTP error! status: ${response.status}`;
      const error = new Error(message) as any;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  },

  async register(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const rawMsg = data.message;
      const message = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : rawMsg || 'Registration failed';
      const error = new Error(message) as any;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data.accessToken) {
      await authService.setTokens(data.accessToken);
    }
    return data;
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const rawMsg = data.message;
      const message = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : rawMsg || 'Login failed';
      const error = new Error(message) as any;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data.accessToken) {
      await authService.setTokens(data.accessToken);
    }
    return data;
  },

  async getMe() {
    return this.fetchWithAuth('/auth/me');
  },

  async getMyProfile() {
    return this.fetchWithAuth('/user-profile/me');
  },

  async createProfile(
    payload: CreateUserProfilePayload,
  ) {
    return this.fetchWithAuth('/user-profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateMyProfile(
    payload: UpdateUserProfilePayload,
  ) {
    return this.fetchWithAuth('/user-profile/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async checkUsername(username: string) {
    const response = await fetch(`${API_BASE_URL}/user-profile/check-username/${encodeURIComponent(username)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP error! status: ${response.status}`;
      const error = new Error(message) as any;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return response.json();
  },
};
