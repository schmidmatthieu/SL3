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
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api/profiles/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateAvatar: async (formData: FormData): Promise<Profile> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api/profiles/me/avatar`, {
      method: 'POST',
      body: formData,
      // Ne pas définir Content-Type ici, il sera automatiquement défini avec le boundary pour FormData
      headers: {
        ...getAuthHeaders(),
      },
    });
  },
};
