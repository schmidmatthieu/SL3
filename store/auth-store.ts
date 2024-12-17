import { create } from 'zustand';
import type { User } from '@/types/auth';
import type { Profile } from '@/types/profile';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  token: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setToken: (token) => {
    if (token) {
      document.cookie = `token=${token}; path=/`;
    }
    set({ token });
  },
  signOut: () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    set({ user: null, profile: null, token: null });
  },
}));
