import { Profile } from '@/types/profile';
import { API_CONFIG } from './config';
import { getAuthHeaders, handleApiResponse } from './utils';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
  });
  return handleApiResponse(response);
};

export const profileService = {
  getMyProfile: async (): Promise<Profile> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api/profiles/me`);
  },

  update: async (data: Partial<Profile>): Promise<Profile> => {
    const cleanedData = Object.fromEntries(
      Object.entries(data)
        .filter(([_, value]) => value !== undefined && value !== '')
    );

    if (Object.keys(cleanedData).length === 0) {
      throw new Error('No valid data to update');
    }

    return fetchWithAuth(`${API_CONFIG.baseUrl}/api/profiles/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedData),
    });
  },

  updateAvatar: async (formData: FormData): Promise<Profile> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api/profiles/me/avatar`, {
      method: 'POST',
      body: formData,
    });
  },
};
