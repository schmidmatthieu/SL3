import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Profile {
  id?: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  preferredLanguage: string;
  theme: 'dark' | 'light' | 'system';
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
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
          const response = await fetch('/api/profiles/me');
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          const profile = await response.json();
          set({ profile, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/profiles/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to update profile');
          }

          const updatedProfile = await response.json();
          set({ profile: updatedProfile, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      reset: () => {
        set({ profile: null, isLoading: false, error: null });
      },
    }),
    {
      name: 'profile-store',
    }
  )
);
