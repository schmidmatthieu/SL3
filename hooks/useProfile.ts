import { useEffect } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { useAuth } from '@/hooks/use-auth';

export const useProfile = () => {
  const { user } = useAuth();
  const {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    reset,
  } = useProfileStore();

  useEffect(() => {
    if (user && !profile && !isLoading) {
      fetchProfile();
    }
  }, [user]); // Enlever fetchProfile des dépendances

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    updateAvatar,
    reset,
  };
};
