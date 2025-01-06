'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

import type { User } from '@/types/auth';
import type { Profile } from '@/types/profile';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, setUser, setProfile, setLoading, signOut, setToken } =
    useAuthStore();

  useEffect(() => {
    const getSession = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          setLoading(false);
          return;
        }

        // Store token in the auth store
        setToken(token);

        // Fetch user data from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();

        // Set user and profile data if data exists
        if (data) {
          // Créer un objet user avec uniquement les propriétés nécessaires
          const user = {
            id: data.id,
            email: data.email,
            role: data.role,
          };

          // Créer un profil complet avec toutes les informations
          const profile = {
            id: data.id,
            email: data.email,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            imageUrl: data.imageUrl,
            preferredLanguage: data.preferredLanguage,
            theme: data.theme,
            role: data.role,
          };

          // Mettre à jour le user et le profile en même temps
          setUser(user);
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        signOut();
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, [setUser, setProfile, setLoading, signOut, setToken]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
