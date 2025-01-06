import { Event } from '@/types/event';
import { Room } from '@/types/room';

import { API_CONFIG } from './config';
import { getAuthHeaders, handleApiResponse } from './utils';

const DEFAULT_EVENT_IMAGE = 'http://localhost:3001/uploads/url_1736013052197.jpeg';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    console.log('Fetching:', url);
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
      console.error('API Error:', { url, status: response.status, error: errorMessage });
      throw new Error(errorMessage);
    }

    return handleApiResponse(response);
  } catch (error) {
    console.error('Fetch error:', { url, error });
    throw error;
  }
};

const transformEventResponse = (event: any): Event => {
  // Assurons-nous que rooms est toujours un tableau
  const rooms = Array.isArray(event.rooms)
    ? event.rooms
        .map((room: any) => {
          // Si c'est juste un ID, on le garde comme référence
          if (typeof room === 'string') {
            return { _id: room };
          }
          // Si c'est un objet room complet, on le transforme
          return transformRoomResponse(room);
        })
        .filter(Boolean)
    : [];

  return {
    ...event,
    rooms,
  };
};

const transformRoomResponse = (room: any): Room | null => {
  // Si c'est juste un ID, on retourne un objet room minimal
  if (typeof room === 'string') {
    return { _id: room };
  }

  // Si c'est un objet room mais qu'il manque des champs requis
  if (!room.name || !room.eventId || !room.status) {
    return null;
  }

  // Transformation complète d'une room
  return {
    _id: room._id || room.id,
    name: room.name,
    eventId: room.eventId,
    status: room.status,
    capacity: room.capacity,
    description: room.description || '',
    startDateTime: room.startDateTime,
    endDateTime: room.endDateTime,
    thumbnail: room.thumbnail || '',
    isPublic: room.isPublic ?? true,
    chatEnabled: room.chatEnabled ?? true,
    recordingEnabled: room.recordingEnabled ?? true,
    originalLanguage: room.originalLanguage || 'en',
    availableLanguages: Array.isArray(room.availableLanguages) ? room.availableLanguages : [],
    createdBy: room.createdBy,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
};

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const events = await fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}`);
    return events.map(transformEventResponse);
  },

  getMyEvents: async (): Promise<Event[]> => {
    const events = await fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/my`);
    return events.map(transformEventResponse);
  },

  getById: async (id: string): Promise<Event> => {
    const event = await fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${id}`);
    return transformEventResponse(event);
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    const eventData = {
      ...data,
      imageUrl: data.imageUrl || DEFAULT_EVENT_IMAGE,
    };

    console.log('Creating event with data:', eventData);

    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    );

    return transformEventResponse(response);
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
    console.log('eventService.update: Données reçues:', data);

    // Vérifier le format des dates avant l'envoi
    if (data.startDateTime) {
      console.log('eventService.update: startDateTime avant envoi:', data.startDateTime);
    }
    if (data.endDateTime) {
      console.log('eventService.update: endDateTime avant envoi:', data.endDateTime);
    }

    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    console.log('eventService.update: Réponse du serveur:', response);
    return transformEventResponse(response);
  },

  updateStatus: async (id: string, status: Event['status']): Promise<Event> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );
    return transformEventResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${id}`, {
      method: 'DELETE',
    });
  },

  join: async (id: string): Promise<Event> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${id}/join`, {
      method: 'POST',
    });
  },

  leave: async (id: string): Promise<Event> => {
    return fetchWithAuth(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${id}/leave`, {
      method: 'POST',
    });
  },

  getRooms: async (eventId: string): Promise<Room[]> => {
    const rooms = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms`
    );
    return rooms.map(transformRoomResponse);
  },

  createRoom: async (eventId: string, data: Partial<Room>): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms`,
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

  updateRoom: async (eventId: string, roomId: string, data: Partial<Room>): Promise<Room> => {
    const response = await fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms/${roomId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    return transformRoomResponse(response);
  },

  deleteRoom: async (eventId: string, roomId: string): Promise<void> => {
    return fetchWithAuth(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}/${eventId}/rooms/${roomId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
