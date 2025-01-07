import { API_CONFIG } from '../config/api.config';
import { Room } from '../../types/room';

import { getAuthHeaders, handleApiResponse } from '../../utils';

interface CreateRoomDTO {
  name: string;
  description?: string;
  eventSlug: string;
  status: string;
  settings?: RoomSettings;
}

interface UpdateRoomDTO extends Partial<CreateRoomDTO> {}

interface RoomSettings {
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  maxParticipants: number;
  allowQuestions: boolean;
  originalLanguage: string;
  availableLanguages: string[];
}

interface StreamSettings {
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  maxParticipants: number;
  allowQuestions: boolean;
  originalLanguage: string;
  availableLanguages: string[];
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return handleApiResponse(response);
};

const transformRoomResponse = (response: any): Room => {
  return {
    ...response,
    id: response.id || response._id,
    slug: response.slug,
    eventSlug: response.eventSlug,
  };
};

export const roomService = {
  // Récupérer toutes les rooms d'un événement
  getEventRooms: async (eventSlug: string): Promise<Room[]> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/events/${eventSlug}/rooms`
    );
    return response.map(transformRoomResponse);
  },

  // Récupérer une room spécifique
  getById: async (eventSlug: string, roomSlug: string): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/events/${eventSlug}/rooms/${roomSlug}`
    );
    return transformRoomResponse(response);
  },

  // Créer une nouvelle room
  create: async (eventSlug: string, data: CreateRoomDTO): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/events/${eventSlug}/rooms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return transformRoomResponse(response);
  },

  // Mettre à jour une room
  update: async (roomSlug: string, data: UpdateRoomDTO): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/rooms/${roomSlug}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return transformRoomResponse(response);
  },

  // Supprimer une room
  delete: async (roomSlug: string): Promise<void> => {
    await fetchWithAuth(`${API_CONFIG.baseUrl}/rooms/${roomSlug}`, {
      method: 'DELETE',
    });
  },

  // Démarrer le streaming d'une room
  startStream: async (roomSlug: string): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/rooms/${roomSlug}/stream/start`,
      {
        method: 'POST',
      }
    );
    return transformRoomResponse(response);
  },

  // Arrêter le streaming d'une room
  stopStream: async (roomSlug: string): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/rooms/${roomSlug}/stream/stop`,
      {
        method: 'POST',
      }
    );
    return transformRoomResponse(response);
  },

  // Mettre en pause le streaming d'une room
  pauseStream: async (roomSlug: string): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/rooms/${roomSlug}/stream/pause`,
      {
        method: 'POST',
      }
    );
    return transformRoomResponse(response);
  },

  // Terminer le streaming d'une room
  endStream: async (roomSlug: string): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/rooms/${roomSlug}/stream/end`,
      {
        method: 'POST',
      }
    );
    return transformRoomResponse(response);
  },

  // Mettre à jour les paramètres de streaming d'une room
  updateStreamSettings: async (
    roomSlug: string,
    settings: StreamSettings
  ): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}/rooms/${roomSlug}/stream/settings`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      }
    );
    return transformRoomResponse(response);
  },

  // Récupérer les informations de streaming d'une room
  getStreamInfo: async (
    roomSlug: string
  ): Promise<{
    streamUrl?: string;
    status: string;
    viewerCount: number;
    startedAt?: string;
    languages: string[];
  }> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}/rooms/${roomSlug}/stream`
    );
  },
};
