import { Room } from '@/types/room';

import { API_CONFIG } from './config';
import { getAuthHeaders, handleApiResponse } from './utils';

interface CreateRoomDTO {
  title: string;
  eventId: string;
  languages: string[];
  startTime: string;
  endTime: string;
  thumbnail?: string;
}

interface UpdateRoomDTO {
  title?: string;
  languages?: string[];
  startTime?: string;
  endTime?: string;
  thumbnail?: string;
  status?: string;
}

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

export const roomService = {
  // Récupérer toutes les rooms d'un événement
  getEventRooms: async (eventId: string): Promise<Room[]> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms`
    );
  },

  // Récupérer une room spécifique
  getById: async (eventId: string, roomId: string): Promise<Room> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms/${roomId}`
    );
  },

  // Créer une nouvelle room
  create: async (eventId: string, data: CreateRoomDTO): Promise<Room> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
  },

  // Mettre à jour une room
  update: async (eventId: string, roomId: string, data: UpdateRoomDTO): Promise<Room> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms/${roomId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
  },

  // Supprimer une room
  delete: async (eventId: string, roomId: string): Promise<void> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms/${roomId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Démarrer le streaming d'une room
  startStream: async (eventId: string, roomId: string): Promise<Room> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stream}/rooms/${roomId}/start`,
      {
        method: 'POST',
      }
    );
  },

  // Arrêter le streaming d'une room
  stopStream: async (eventId: string, roomId: string): Promise<Room> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stream}/rooms/${roomId}/stop`,
      {
        method: 'POST',
      }
    );
  },

  // Récupérer les informations de streaming d'une room
  getStreamInfo: async (
    eventId: string,
    roomId: string
  ): Promise<{
    streamUrl?: string;
    status: string;
    viewerCount: number;
    startedAt?: string;
    languages: string[];
  }> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stream}/rooms/${roomId}`
    );
  },
};
