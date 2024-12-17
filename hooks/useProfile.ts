import { useEffect } from 'react';
import { useProfileStore } from '../store/profile.store';

export const useProfile = () => {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useProfileStore();

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    fetchProfile,
  };
};
