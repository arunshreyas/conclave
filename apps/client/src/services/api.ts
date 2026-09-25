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

  // Rapid Fire API
  async startRapidFire(payload: { mode?: string; subject?: string; topic?: string; questionCount?: number }) {
    return this.fetchWithAuth('/rapid-fire/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async answerRapidFireQuestion(sessionId: string, payload: { questionId: string; selectedAnswer: string; timeTakenSec?: number }) {
    return this.fetchWithAuth(`/rapid-fire/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async finishRapidFireSession(sessionId: string) {
    return this.fetchWithAuth(`/rapid-fire/${sessionId}/finish`, {
      method: 'POST',
    });
  },

  async getRapidFireSession(sessionId: string) {
    return this.fetchWithAuth(`/rapid-fire/${sessionId}`);
  },

  async getWeakTopicsAnalytics() {
    return this.fetchWithAuth('/rapid-fire/weak-topics/analytics');
  },

  // Questions API
  async getSubjectsMetadata() {
    return this.fetchWithAuth('/questions/subjects');
  },

  async getSavedQuestions() {
    return this.fetchWithAuth('/questions/saved/all');
  },

  async saveQuestion(questionId: string, notes?: string) {
    return this.fetchWithAuth(`/questions/${questionId}/save`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async unsaveQuestion(questionId: string) {
    return this.fetchWithAuth(`/questions/${questionId}/save`, {
      method: 'DELETE',
    });
  },

  // Custom Papers API
  async generateCustomPaper(payload: { title?: string; subject?: string; chapter?: string; topics?: string[]; difficulty?: string; durationMinutes?: number; totalQuestions?: number }) {
    return this.fetchWithAuth('/papers/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getPapers() {
    return this.fetchWithAuth('/papers');
  },

  async getPaperDetails(paperId: string) {
    return this.fetchWithAuth(`/papers/${paperId}`);
  },

  async submitPaper(paperId: string, payload: { answers: Array<{ questionId: string; selectedAnswer?: string; timeSpentSec?: number }>; totalTimeSpentSec?: number }) {
    return this.fetchWithAuth(`/papers/${paperId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Progress & Dashboard API
  async getDashboard() {
    return this.fetchWithAuth('/progress/dashboard');
  },

  async getAnalytics() {
    return this.fetchWithAuth('/progress/analytics');
  },

  async getAttempts(limit?: number) {
    return this.fetchWithAuth(`/progress/attempts${limit ? `?limit=${limit}` : ''}`);
  },

  // Documents & Notes API
  async uploadDocument(payload: { title: string; docType?: string; fileType?: string; text?: string; fileUrl?: string }) {
    return this.fetchWithAuth('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getDocuments() {
    return this.fetchWithAuth('/documents');
  },

  async getDocumentDetails(documentId: string) {
    return this.fetchWithAuth(`/documents/${documentId}`);
  },
};
