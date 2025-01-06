import { API_CONFIG } from '@/services/api/config';
import { getAuthHeaders } from '@/services/api/utils';
import { useEventStore } from '@/store/event.store';
import { useSpeakerStore } from '@/store/speaker.store';
import { create } from 'zustand';

import { Room } from '@/types/room';

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

  setRooms: rooms => set({ rooms }),
  setLoading: loading => set({ isLoading: loading }),
  setError: error => set({ error }),

  fetchEventRooms: async (eventId: string) => {
    const { setLoading, setError, setRooms } = get();
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/event/${eventId}`, {
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw room data from API:', data);
      
      // Ensure we have an array of rooms with proper IDs
      const formattedRooms = Array.isArray(data) ? data.map(room => {
        const formattedRoom = {
          ...room,
          id: room._id || room.id, // Always use id for consistency
          _id: room._id || room.id // Keep _id for MongoDB compatibility
        };
        console.log('Formatted room:', formattedRoom);
        return formattedRoom;
      }) : [];
      
      setRooms(formattedRooms);
      setError(null);
      
      console.log('Final formatted rooms:', formattedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch rooms'));
      setRooms([]);
    } finally {
      setLoading(false);
    }
  },

  createRoom: async data => {
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

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newRoom = await response.json();
      setRooms([...rooms, newRoom]);

      return newRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error instanceof Error ? error : new Error('Failed to create room'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  updateRoom: async (roomId: string, updateData: Partial<Room>) => {
    const { setLoading, setError, setRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);

      // Récupérer la room actuelle
      const currentRoom = rooms.find(room => room._id === roomId);
      if (!currentRoom) {
        throw new Error('Room not found');
      }

      // Construire les données de mise à jour
      const data = {
        ...updateData,
        settings: {
          ...currentRoom.settings,
          ...(updateData.settings || {}),
        },
      };

      // Appeler l'API
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedRoom = await response.json();

      // Mettre à jour le store
      setRooms(
        rooms.map(room =>
          room._id === roomId
            ? {
                ...room,
                ...updatedRoom,
                settings: {
                  ...room.settings,
                  ...updatedRoom.settings,
                },
              }
            : room
        )
      );

      // Mettre à jour les speakers dans leur store si nécessaire
      if (updateData.speakers) {
        const speakerStore = useSpeakerStore.getState();
        const updatedSpeakers = speakerStore.speakers.map(speaker => {
          const isSpeakerInRoom = updateData.speakers?.includes(speaker._id);
          const hasRoom = speaker.rooms?.includes(roomId);

          if (isSpeakerInRoom && !hasRoom) {
            // Ajouter la room au speaker
            return {
              ...speaker,
              rooms: [...(speaker.rooms || []), roomId],
            };
          } else if (!isSpeakerInRoom && hasRoom) {
            // Retirer la room du speaker
            return {
              ...speaker,
              rooms: speaker.rooms?.filter(id => id !== roomId) || [],
            };
          }
          return speaker;
        });

        useSpeakerStore.setState({ speakers: updatedSpeakers });
      }

    } catch (error) {
      console.error('Error updating room:', error);
      setError(error instanceof Error ? error : new Error('Failed to update room'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  deleteRoom: async (eventId: string, roomId: string) => {
    const { setLoading, setError, setRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mettre à jour le store
      setRooms(rooms.filter(room => room._id !== roomId));

      // Retirer la room de tous les speakers
      const speakerStore = useSpeakerStore.getState();
      const updatedSpeakers = speakerStore.speakers.map(speaker => ({
        ...speaker,
        rooms: speaker.rooms?.filter(id => id !== roomId) || [],
      }));
      useSpeakerStore.setState({ speakers: updatedSpeakers });

    } catch (error) {
      console.error('Error deleting room:', error);
      setError(error instanceof Error ? error : new Error('Failed to delete room'));
      throw error;
    } finally {
      setLoading(false);
    }
  },

  startStream: async roomId => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
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

  stopStream: async roomId => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/stop`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
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

  pauseStream: async roomId => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/pause`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
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

  endStream: async roomId => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/stream/stop`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
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

  cancelRoom: async roomId => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/cancel`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
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

  reactivateRoom: async roomId => {
    const { setLoading, setError, fetchEventRooms, rooms } = get();
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rooms}/${roomId}/reactivate`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
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
