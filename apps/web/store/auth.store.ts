import { create } from 'zustand';
import api from '@/lib/api';
import { requestNotificationPermission } from '@/lib/firebase';

async function registerFcmToken() {
  try {
    const token = await requestNotificationPermission();
    if (token) await api.post('/notifications/fcm-token', { fcmToken: token });
  } catch {}
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ accessToken: token, user: JSON.parse(user) });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, accessToken: data.accessToken });
      registerFcmToken();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password, role = 'USER') => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, accessToken: data.accessToken });
      registerFcmToken();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null });
  },
}));
