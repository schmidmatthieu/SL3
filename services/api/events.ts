import { Event } from '@/types/event';
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

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}`);
  },

  getMyEvents: async (): Promise<Event[]> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}/my`);
  },

  getById: async (id: string): Promise<Event> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}/${id}`);
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
    console.log('Updating event:', { id, data });
    // Essayons avec PUT au lieu de PATCH
    const response = await fetch(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}/${id}`, {
      method: 'PUT',  // Changement de PATCH à PUT
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    console.log('Update response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });

    return handleApiResponse(response);
  },

  updateStatus: async (id: string, status: Event['status']): Promise<Event> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}/${id}`, {
      method: 'DELETE',
    });
  },

  join: async (id: string): Promise<Event> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}/${id}/join`, {
      method: 'POST',
    });
  },

  leave: async (id: string): Promise<Event> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}/api${API_CONFIG.endpoints.events}/${id}/leave`, {
      method: 'POST',
    });
  },
};
