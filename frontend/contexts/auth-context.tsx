'use client';

import { createContext, useContext } from 'react';
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  avatar_url?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }

      set({ 
        user: data.user, 
        token: data.access_token,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ 
        error: error.message || 'An error occurred while signing in',
        isLoading: false,
        user: null,
        token: null
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, username?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }

      set({ 
        user: data.user, 
        token: data.access_token,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ 
        error: error.message || 'An error occurred during registration',
        isLoading: false,
        user: null,
        token: null
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to sign out');
      }

      localStorage.removeItem('auth_token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      set({ user: null, token: null, isLoading: false, error: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message || 'An error occurred while signing out', isLoading: false });
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          set({ user: null, token: null, isLoading: false });
          return;
        }
        throw new Error('Failed to refresh session');
      }

      const data = await response.json();
      
      set({ 
        user: data.user, 
        token: data.access_token || token,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Session refresh error:', error);
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

const AuthContext = createContext<ReturnType<typeof useAuthStore> | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuthStore, AuthContext };
