import { create } from 'zustand';
import { mediaService } from '@/services/api/media';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? 
    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : 
    null;
  console.log('Token:', token); // Debug log
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  imageUrl: string;
  preferredLanguage: 'en' | 'fr' | 'de' | 'it';
  theme: 'light' | 'dark' | 'system';
}

interface ProfileState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching user data...');
      const headers = getAuthHeaders();
      console.log('Headers:', headers);
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Profile data:', data);
      
      set({ user: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ error: 'Failed to fetch profile', isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user data');
      }
      
      const updatedUser = await response.json();
      set((state) => ({ 
        user: { ...state.user, ...updatedUser },
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to update user data', isLoading: false });
      throw error;
    }
  },

  updatePassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/api/auth/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update password');
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update password', isLoading: false });
      throw error;
    }
  },

  updateAvatar: async (file) => {
    set({ isLoading: true, error: null });
    try {
      // Utiliser le service media pour l'upload
      const uploadResponse = await mediaService.uploadImage(file);
      console.log('Image uploaded successfully:', uploadResponse);

      // Mettre à jour le profil avec la nouvelle URL d'image
      const updateResponse = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ imageUrl: uploadResponse.url }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile with new avatar');
      }

      const userData = await updateResponse.json();
      set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating avatar:', error);
      set({ error: 'Failed to update avatar', isLoading: false });
      throw error;
    }
  },
}));
