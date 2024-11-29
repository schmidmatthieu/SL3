'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { AuthContext, useAuthStore } from '@/contexts/auth-context';

const REFRESH_INTERVAL = 1000 * 60 * 14; // 14 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Create a stable store reference
  const store = useMemo(() => useAuthStore.getState(), []);

  // Initialize token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      useAuthStore.setState({ token: storedToken });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      await store.refreshSession();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }, [store]);

  useEffect(() => {
    console.log('AuthProvider mounted');

    // Initial session check
    refreshToken();

    // Set up periodic token refresh
    const intervalId = setInterval(refreshToken, REFRESH_INTERVAL);

    // Subscribe to store changes
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.token,
      (token) => {
        console.log('Token changed:', token);
        if (!token) {
          clearInterval(intervalId);
        }
      }
    );

    // Clean up interval and subscription on unmount
    return () => {
      console.log('AuthProvider unmounted');
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [refreshToken]);

  // Set up unauthorized event handler
  useEffect(() => {
    const handleUnauthorized = async () => {
      try {
        console.log('Unauthorized event detected');
        await refreshToken();
      } catch (error) {
        console.error('Error during unauthorized handling:', error);
        await store.signOut();
      }
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [refreshToken, store]);

  return (
    <AuthContext.Provider value={store}>
      {children}
    </AuthContext.Provider>
  );
}
