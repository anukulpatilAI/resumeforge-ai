import { create } from 'zustand';
import { api, loginApi, registerApi, logoutApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  login: async (email, password) => {
    const data = await loginApi(email, password);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  register: async (email, password, fullName) => {
    const data = await registerApi(email, password, fullName);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await logoutApi();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    try {
      const data = await api.get<{ id: string; email: string; fullName: string; role: string; isVerified: boolean }>('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
