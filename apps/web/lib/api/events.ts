import { Event } from '@/types/event';
import { Room } from '@/types/room';

import { API_CONFIG } from '../config/api.config';
import { getAuthHeaders, handleApiResponse } from './utils';

const DEFAULT_EVENT_IMAGE = 'http://localhost:3001/uploads/url_1736013052197.jpeg';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    // Ne pas ajouter Content-Type pour FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
      console.error('API Error:', { url, status: response.status, error: errorMessage, details: errorData });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', { url, error });
    throw error;
  }
};

const slugify = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

const transformEventResponse = (event: any): Event => {
  if (!event) {
    console.error('Received null or undefined event');
    throw new Error('Invalid event data');
  }


  // Assurons-nous que rooms est toujours un tableau
  const rooms = Array.isArray(event.rooms)
    ? event.rooms
        .map((room: any) => {
          try {
            // Si c'est juste un ID, on le garde comme référence
            if (typeof room === 'string') {
              return { _id: room };
            }
            // Si c'est un objet room complet, on le transforme
            return transformRoomResponse(room);
          } catch (error) {
            console.error('Error transforming room:', error);
            return null;
          }
        })
        .filter(Boolean)
    : [];

  const transformedEvent = {
    _id: event._id || undefined,
    id: event._id || event.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    slug: event.slug || slugify(event.title),
    title: event.title || '',
    description: event.description || '',
    shortDescription: event.shortDescription || '',
    startDateTime: event.startDateTime || null,
    endDateTime: event.endDateTime || null,
    imageUrl: event.imageUrl || DEFAULT_EVENT_IMAGE,
    status: event.status || 'draft',
    location: event.location || '',
    maxParticipants: event.maxParticipants || 0,
    currentParticipants: event.currentParticipants || 0,
    rooms: rooms,
    createdBy: event.createdBy || null,
    createdAt: event.createdAt || new Date().toISOString(),
    updatedAt: event.updatedAt || new Date().toISOString(),
    featured: event.featured || false,
  };

  return transformedEvent;
};

const transformRoomResponse = (room: any): Room | null => {
  if (!room) return null;

  try {
    return {
      id: room._id || room.id,
      slug: room.slug || '',
      name: room.name || '',
      description: room.description || '',
      status: room.status || 'upcoming',
      startDateTime: room.startDateTime || null,
      endDateTime: room.endDateTime || null,
      maxParticipants: room.maxParticipants || 0,
      currentParticipants: room.currentParticipants || 0,
      speakers: Array.isArray(room.speakers) ? room.speakers : [],
      moderators: Array.isArray(room.moderators) ? room.moderators : [],
      eventId: room.eventId || room.event || null,
      createdAt: room.createdAt || new Date().toISOString(),
      updatedAt: room.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error transforming room:', error);
    return null;
  }
};

export const eventService = {
  async getAll(): Promise<Event[]> {
    const data = await fetchWithAuth(`${API_CONFIG.endpoints.events}`);
    return data.map(transformEventResponse);
  },

  async getMyEvents(): Promise<Event[]> {
    const data = await fetchWithAuth(`${API_CONFIG.endpoints.events}/my`);
    return data.map(transformEventResponse);
  },

  async getOne(idOrSlug: string): Promise<Event> {
    const data = await fetchWithAuth(`${API_CONFIG.endpoints.events}/${idOrSlug}`);
    return transformEventResponse(data);
  },

  async getById(id: string): Promise<Event> {
    const data = await fetchWithAuth(`${API_CONFIG.endpoints.events}/${id}`);
    return transformEventResponse(data);
  },

  async create(data: Partial<Event>): Promise<Event> {

    const response = await fetchWithAuth(`${API_CONFIG.endpoints.events}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        imageUrl: data.imageUrl || DEFAULT_EVENT_IMAGE,
        status: data.status || 'scheduled',
      }),
    });

    return transformEventResponse(response);
  },

  async update(idOrSlug: string, data: Partial<Event>): Promise<Event> {

    // Si nous avons un fichier image, utiliser FormData
    if (data.imageFile) {
      const formData = new FormData();
      
      // Ajouter les champs de base en JSON
      const jsonData = { ...data };
      delete jsonData.imageFile;
      formData.append('data', JSON.stringify(jsonData));
      
      // Ajouter le fichier image
      formData.append('image', data.imageFile);

      const response = await fetchWithAuth(`${API_CONFIG.endpoints.events}/${idOrSlug}`, {
        method: 'PATCH',
        body: formData,
      });

      return transformEventResponse(response);
    }

    // Sinon, envoyer les données en JSON
    const response = await fetchWithAuth(`${API_CONFIG.endpoints.events}/${idOrSlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return transformEventResponse(response);
  },

  async updateStatus(idOrSlug: string, status: Event['status']): Promise<Event> {
    const response = await fetchWithAuth(
      `${API_CONFIG.endpoints.events}/${idOrSlug}`,
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

  async delete(idOrSlug: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.endpoints.events}/${idOrSlug}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData?.message || errorMessage;
      } catch {
        // Si le texte n'est pas du JSON, on utilise le texte brut comme message d'erreur
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    // Pas besoin de parser la réponse en JSON pour une suppression
  },

  async join(id: string): Promise<Event> {
    const response = await fetchWithAuth(`${API_CONFIG.endpoints.events}/${id}/join`, {
      method: 'POST',
    });
    return transformEventResponse(response);
  },

  async leave(id: string): Promise<Event> {
    const response = await fetchWithAuth(`${API_CONFIG.endpoints.events}/${id}/leave`, {
      method: 'POST',
    });
    return transformEventResponse(response);
  },

  async getRooms(eventId: string): Promise<Room[]> {
    const data = await fetchWithAuth(`${API_CONFIG.endpoints.events}/${eventId}/rooms`);
    return data.map((room: any) => transformRoomResponse(room)).filter(Boolean);
  },

  async createRoom(idOrSlug: string, roomData: Partial<Room>): Promise<Room> {
    const response = await fetchWithAuth(
      `${API_CONFIG.endpoints.events}/${idOrSlug}/rooms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      }
    );

    const room = transformRoomResponse(response);
    if (!room) throw new Error('Failed to create room');
    return room;
  },

  async updateRoom(eventId: string, roomId: string, data: Partial<Room>): Promise<Room> {
    const response = await fetchWithAuth(
      `${API_CONFIG.endpoints.events}/${eventId}/rooms/${roomId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    const room = transformRoomResponse(response);
    if (!room) throw new Error('Failed to update room');
    return room;
  },

  async deleteRoom(eventId: string, roomId: string): Promise<void> {
    await fetchWithAuth(`${API_CONFIG.endpoints.events}/${eventId}/rooms/${roomId}`, {
      method: 'DELETE',
    });
  },
};
