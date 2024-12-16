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
        // Check for stored data first
        const storedUser = localStorage.getItem('user');
        const storedProfile = localStorage.getItem('profile');
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        if (!token) {
          setLoading(false);
          return;
        }

        if (storedUser && storedProfile) {
          setUser(JSON.parse(storedUser));
          setProfile(JSON.parse(storedProfile));
          setLoading(false);
          return;
        }

        // If no stored data, fetch from API
        const response = await fetch('http://localhost:3001/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        
        // Update stored data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile));
      } catch (error) {
        console.error('Auth error:', error);
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Check session periodically
    const interval = setInterval(getSession, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [setUser, setProfile, setLoading]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}