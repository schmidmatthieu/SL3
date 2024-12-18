import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Profile } from '@/types/profile';
import { profileService } from '@/services/api/profiles';

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
          set({ isLoading: true, error: null });
          const profile = await profileService.getMyProfile();
          set({ profile, isLoading: false });
        } catch (error) {
          console.error('Error fetching profile:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      updateProfile: async (data: Partial<Profile>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedProfile = await profileService.update(data);
          set({ profile: updatedProfile, isLoading: false });
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
          set({ profile: updatedProfile, isLoading: false });
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
      },
    }),
    {
      name: 'profile-store',
    }
  )
);
