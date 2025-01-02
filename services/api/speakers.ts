import { CreateSpeakerDto, Speaker, UpdateSpeakerDto } from '@/types/speaker';

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

export const speakerService = {
  getAll: async (eventId: string): Promise<Speaker[]> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers`);
  },

  getById: async (eventId: string, speakerId: string): Promise<Speaker> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}`
    );
  },

  create: async (eventId: string, data: CreateSpeakerDto): Promise<Speaker> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
          rooms: data.rooms || [],
          eventId: data.eventId,
        }),
      }
    );
  },

  update: async (eventId: string, speakerId: string, data: UpdateSpeakerDto): Promise<Speaker> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl,
          rooms: data.rooms || [],
        }),
      }
    );
  },

  delete: async (eventId: string, speakerId: string): Promise<void> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}`,
      {
        method: 'DELETE',
      }
    );
  },

  uploadImage: async (
    eventId: string,
    speakerId: string,
    file: File
  ): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/speakers/${speakerId}/image`,
      {
        method: 'POST',
        body: formData,
      }
    );
  },
};
