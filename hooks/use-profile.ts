import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import type { Profile } from '@/types/profile';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  preferredLanguage?: string;
  theme?: 'light' | 'dark' | 'system';
}

export const useProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    if (!user) {
      setError('User must be authenticated to get profile');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profiles/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const fetchedProfile: Profile = await response.json();
      setProfile(fetchedProfile);
      return fetchedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    if (!user) {
      setError('User must be authenticated to update profile');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile: Profile = await response.json();
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    updateProfile,
    getProfile,
    loading,
    error,
  };
};
