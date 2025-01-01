import { create } from 'zustand';
import { Room } from '@/types/room';
import { getAuthHeaders } from '@/services/api/utils';
import { API_CONFIG } from '@/services/api/config';
import { useEventStore } from '@/store/event.store';

interface RoomState {
  rooms: Room[];
  isLoading: boolean;
  error: Error | null;
  setRooms: (rooms: Room[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  fetchEventRooms: (eventId: string) => Promise<void>;
  createRoom: (data: CreateRoomData) => Promise<Room>;
  updateRoom: (roomId: string, data: Partial<Room>) => Promise<void>;
  deleteRoom: (eventId: string, roomId: string) => Promise<void>;
  startStream: (roomId: string) => Promise<void>;
  stopStream: (roomId: string) => Promise<void>;
  pauseStream: (roomId: string) => Promise<void>;
  endStream: (roomId: string) => Promise<void>;
  cancelRoom: (roomId: string) => Promise<void>;
  reactivateRoom: (roomId: string) => Promise<void>;
}

interface CreateRoomData {
  name: string;
  eventId: string;
  description?: string;
  thumbnail?: string;
  startTime: string;
  endTime: string;
  status: string;
  settings: {
    isPublic: boolean;
    chatEnabled: boolean;
    recordingEnabled: boolean;
    maxParticipants: number;
    allowQuestions: boolean;
    originalLanguage: string;
    availableLanguages: string[];
  };
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  isLoading: false,
  error: null,
  
  setRooms: (rooms) => set({ rooms }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchEventRooms: async (eventId) => {
    const { setLoading, setError, setRooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}/api/rooms/event/${eventId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const rooms = await response.json();
      setRooms(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  },

  createRoom: async (data) => {
    const { setLoading, setError, setRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!data.name) {
        throw new Error('Room name is required');
      }
      if (!data.eventId) {
        throw new Error('Event ID is required');
      }
      if (!data.startTime || !data.endTime) {
        throw new Error('Start time and end time are required');
      }

      // Prepare room data with required fields and correct status
      const roomData = {
        ...data,
        status: 'upcoming',
      };

      // Optimistically add the room to the store
      const optimisticRoom = {
        ...roomData,
        _id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [],
        speakers: [],
        moderators: [],
        __v: 0,
      };
      
      setRooms([...rooms, optimisticRoom]);

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        // En cas d'erreur, on retire la room optimiste
        setRooms(rooms.filter(r => r._id !== optimisticRoom._id));
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create room');
      }

      const newRoom = await response.json();
      
      // Remplacer la room optimiste par la vraie room
      setRooms(prevRooms => prevRooms.map(r => r._id === optimisticRoom._id ? newRoom : r));
      
      // Refetch les rooms pour s'assurer d'avoir les données à jour
      await get().fetchEventRooms(data.eventId);

      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  updateRoom: async (roomId, data) => {
    const { setLoading, setError, rooms, setRooms } = get();
    try {
      setLoading(true);
      setError(null);

      console.log('Sending update request with data:', data);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room');
      }
      
      // Mettre à jour la room dans le state local
      const updatedRoom = await response.json();
      console.log('Received updated room:', updatedRoom);
      
      const updatedRooms = rooms.map(room => 
        room._id === roomId ? { ...room, ...updatedRoom } : room
      );
      setRooms(updatedRooms);
    } catch (error) {
      console.error('Error updating room:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  deleteRoom: async (eventId, roomId) => {
    const { setLoading, setError, fetchEventRooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete room');
      await fetchEventRooms(eventId);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  startStream: async (roomId) => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to start stream');
      
      // Mettre à jour localement le statut de la room
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        await fetchEventRooms(room.eventId);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  stopStream: async (roomId) => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to stop stream');
      
      // Mettre à jour localement le statut de la room
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        await fetchEventRooms(room.eventId);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  pauseStream: async (roomId) => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/pause`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to pause stream');
      
      // Mettre à jour localement le statut de la room
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        await fetchEventRooms(room.eventId);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  endStream: async (roomId) => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to end stream');
      
      // Mettre à jour localement le statut de la room
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        await fetchEventRooms(room.eventId);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  cancelRoom: async (roomId) => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to cancel room');
      
      // Mettre à jour localement le statut de la room
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        await fetchEventRooms(room.eventId);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  reactivateRoom: async (roomId) => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/reactivate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to reactivate room');
      
      // Mettre à jour localement le statut de la room
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        await fetchEventRooms(room.eventId);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setLoading(false);
    }
  },
}));
