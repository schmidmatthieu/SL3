'use client';

import { createContext, useContext, useEffect } from 'react';
import type { User } from '@/types/auth';
import type { Profile } from '@/types/profile';
import { useAuthStore } from '@/store/auth-store';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children,
}: { 
  children: React.ReactNode;
}) {
  const { user, profile, loading, setUser, setProfile, setLoading, signOut } = useAuthStore();

  useEffect(() => {
    const getSession = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch user data from API
        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();
        
        // Set user and profile data if data exists
        if (data) {
          const user = {
            id: data.id,
            email: data.email,
            username: data.username,
            role: data.role,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };
          
          const profile = {
            id: data.id,
            userId: data.id,
            role: data.role,
            firstName: data.firstName,
            lastName: data.lastName,
            imageUrl: data.imageUrl,
            bio: data.bio,
            preferredLanguage: data.preferredLanguage,
            theme: data.theme,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };

          setUser(user);
          setProfile(profile);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Session error:', error);
        setLoading(false);
        // Clear data on error
        signOut();
      }
    };

    getSession();
  }, [setUser, setProfile, setLoading, signOut]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}