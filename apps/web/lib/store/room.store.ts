import { API_CONFIG } from '@/lib/api/config';
import { getAuthHeaders } from '@/lib/api/utils';
import { useEventStore } from '@/lib/store/event.store';
import { useSpeakerStore } from '@/lib/store/speaker.store';
import { create } from 'zustand';

import { Room } from '@/types/room';

interface RoomStore {
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  setRooms: (rooms: Room[]) => void;
  setSelectedRoom: (room: Room | null) => void;
  fetchEventRooms: (eventSlug: string) => Promise<void>;
  createRoom: (data: CreateRoomDTO) => Promise<void>;
  updateRoom: (roomId: string, data: UpdateRoomDTO) => Promise<void>;
  deleteRoom: (eventSlug: string, roomId: string) => Promise<void>;
  startStream: (roomId: string) => Promise<Room>;
  stopStream: (roomId: string) => Promise<Room>;
  pauseStream: (roomId: string) => Promise<Room>;
  endStream: (roomId: string) => Promise<Room>;
  setError: (error: string | null) => void;
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  eventSlug: string;
  status: string;
  startTime?: string;
  endTime?: string;
  settings?: RoomSettings;
  speakers?: string[];
  participants?: string[];
  thumbnail?: string;
}

interface CreateRoomDTO {
  name: string;
  eventSlug: string;
  description?: string;
  thumbnail?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  settings?: RoomSettings;
}

interface UpdateRoomDTO {
  name?: string;
  description?: string;
  thumbnail?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  settings?: RoomSettings;
}

interface RoomSettings {
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  maxParticipants: number;
  allowQuestions: boolean;
  originalLanguage: string;
  availableLanguages: string[];
}

// Fonction pour générer un slug à partir d'un nom
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  rooms: [],
  selectedRoom: null,
  isLoading: false,
  error: null,

  setRooms: (rooms) => set({ rooms }),
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setError: (error) => set({ error }),

  fetchEventRooms: async (eventSlug) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/event/${eventSlug}`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch rooms');
      }

      const roomsData = await response.json();
      
      // Normaliser les IDs pour toutes les salles
      const normalizedRooms = roomsData.map((room: any) => ({
        ...room,
        _id: room._id || room.id
      }));

      set({ rooms: normalizedRooms, isLoading: false });
    } catch (error) {
      console.error('Error fetching rooms:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch rooms',
        isLoading: false,
      });
    }
  },

  createRoom: async (data: CreateRoomDTO) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          ...data,
          slug: generateSlug(data.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create room');
      }

      const newRoom: Room = await response.json();
      
      // Mettre à jour la liste des salles avec la nouvelle salle
      const { rooms } = get();
      set({ 
        rooms: [...rooms, { ...newRoom, _id: newRoom._id }],
        isLoading: false 
      });

    } catch (error) {
      console.error('Error creating room:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateRoom: async (roomId: string, data: UpdateRoomDTO) => {
    set({ isLoading: true, error: null });
    try {
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      // Supprimer eventSlug des données envoyées
      const { eventSlug, ...updateData } = data;

      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room');
      }

      const updatedRoom = await response.json();
      // Assurer que nous avons un _id cohérent
      const normalizedRoom = {
        ...updatedRoom,
        _id: updatedRoom._id || updatedRoom.id
      };

      const { rooms } = get();
      set({
        rooms: rooms.map((room) => (room._id === roomId ? normalizedRoom : room)),
        selectedRoom: normalizedRoom,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error updating room:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteRoom: async (eventSlug: string, roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/rooms/${roomId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify({ eventSlug }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete room');
      }

      set((state) => ({
        rooms: state.rooms.filter((room) => room._id !== roomId),
        selectedRoom:
          state.selectedRoom?._id === roomId ? null : state.selectedRoom,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting room:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete room',
        isLoading: false,
      });
      throw error;
    }
  },

  startStream: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/start`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[startStream] Error response:', errorData);
        throw new Error(errorData.message || 'Failed to start stream');
      }

      const updatedRoom = await response.json();
      const { rooms } = get();
      set({
        rooms: rooms.map((room) => (room._id === roomId ? updatedRoom : room)),
        isLoading: false,
      });

      return updatedRoom;
    } catch (error) {
      console.error('[startStream] Error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  stopStream: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/stop`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[stopStream] Error response:', errorData);
        throw new Error(errorData.message || 'Failed to stop stream');
      }

      const updatedRoom = await response.json();
      const { rooms } = get();
      set({
        rooms: rooms.map((room) => (room._id === roomId ? updatedRoom : room)),
        isLoading: false,
      });

      return updatedRoom;
    } catch (error) {
      console.error('[stopStream] Error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  pauseStream: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/pause`,
        {
          method: 'POST',
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[pauseStream] Error response:', errorData);
        throw new Error(errorData.message || 'Failed to pause stream');
      }

      const updatedRoom = await response.json();
      const { rooms } = get();
      set({
        rooms: rooms.map((room) => (room._id === roomId ? updatedRoom : room)),
        isLoading: false,
      });

      return updatedRoom;
    } catch (error) {
      console.error('[pauseStream] Error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  endStream: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/end`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders()),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[endStream] Error response:', errorData);
        throw new Error(errorData.message || 'Failed to end stream');
      }

      const updatedRoom = await response.json();
      const { rooms } = get();
      set({
        rooms: rooms.map((room) => (room._id === roomId ? updatedRoom : room)),
        isLoading: false,
      });

      return updatedRoom;
    } catch (error) {
      console.error('[endStream] Error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
