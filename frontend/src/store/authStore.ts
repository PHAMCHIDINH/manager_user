import { create } from 'zustand';
import AuthAPI from '../api/authApi';
import type { AuthResponse } from '../api/authApi';

interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const maybeResponse = error as { response?: { data?: { error?: string } }; message?: unknown };
    const apiMessage = maybeResponse.response?.data?.error;
    if (typeof apiMessage === 'string' && apiMessage.trim()) {
      return apiMessage;
    }
    if (typeof maybeResponse.message === 'string' && maybeResponse.message.trim()) {
      return maybeResponse.message;
    }
  }
  return fallback;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: AuthAPI.getCurrentUser(),
  token: AuthAPI.getToken(),
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await AuthAPI.login({ email, password });
      set({ user: res.user, token: res.token, loading: false });
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Login failed');
      set({ error: message, loading: false });
    }
  },

  register: async (username, email, password, confirmPassword) => {
    try {
      set({ loading: true, error: null });
      const res = await AuthAPI.register({ username, email, password, confirmPassword });
      set({ user: res.user, token: res.token, loading: false });
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Register failed');
      set({ error: message, loading: false });
    }
  },

  logout: () => {
    AuthAPI.logout();
    set({ user: null, token: null });
  },

  initializeAuth: () => {
    const storedUser = AuthAPI.getCurrentUser();
    const storedToken = AuthAPI.getToken();
    if (storedUser && storedToken) {
      set({ user: storedUser, token: storedToken });
    }
  },
}));
