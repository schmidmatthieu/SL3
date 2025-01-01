import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Profile } from '@/types/profile';
import { profileService } from '@/services/api/profiles';
import { useAuthStore } from '@/store/auth-store';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateAvatar: (formData: FormData) => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,

      fetchProfile: async () => {
        try {
          // Check if we have a token before making the API call
          const token = document.cookie.split(';').find(c => c.trim().startsWith('token='));
          if (!token) {
            set({ profile: null, isLoading: false, error: null });
            return;
          }

          set({ isLoading: true, error: null });
          const profile = await profileService.getMyProfile();
          set({ profile, isLoading: false });
          // Sync with auth store
          useAuthStore.getState().setProfile(profile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          // If unauthorized, clear the profile
          if (error.status === 401) {
            set({ profile: null, error: null, isLoading: false });
            return;
          }
          set({ error: error.message, isLoading: false });
        }
      },

      updateProfile: async (data: Partial<Profile>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedProfile = await profileService.update(data);
          set({ profile: updatedProfile, isLoading: false });
          // Sync with auth store
          useAuthStore.getState().setProfile(updatedProfile);
        } catch (error) {
          console.error('Error updating profile:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateAvatar: async (formData: FormData) => {
        try {
          set({ isLoading: true, error: null });
          const updatedProfile = await profileService.updateAvatar(formData);
          // Assurons-nous de préserver les propriétés existantes du profil
          const currentProfile = useProfileStore.getState().profile;
          const mergedProfile = {
            ...currentProfile,
            ...updatedProfile,
          };
          
          // Mettre à jour le profile store
          set({ profile: mergedProfile, isLoading: false });
          
          // Mettre à jour le auth store avec le user minimal et le profil complet
          const authStore = useAuthStore.getState();
          authStore.setProfile(mergedProfile);
          authStore.setUser({
            id: mergedProfile.id,
            email: mergedProfile.email,
            role: mergedProfile.role,
          });
        } catch (error) {
          console.error('Error updating avatar:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      reset: () => {
        set({
          profile: null,
          isLoading: false,
          error: null,
        });
        // Sync with auth store
        useAuthStore.getState().setProfile(null);
      },
    }),
    {
      name: 'profile-store',
    }
  )
);
