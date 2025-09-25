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
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Login failed';
      set({ error: message, loading: false });
    }
  },

  register: async (username, email, password, confirmPassword) => {
    try {
      set({ loading: true, error: null });
      const res = await AuthAPI.register({ username, email, password, confirmPassword });
      set({ user: res.user, token: res.token, loading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Register failed';
      set({ error: message, loading: false });
    }
  },

  logout: () => {
    AuthAPI.logout();
    set({ user: null, token: null });
  },

  initializeAuth: () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser && storedToken) {
      set({
        user: JSON.parse(storedUser),
        token: storedToken,
      });
    }
  },
}));
