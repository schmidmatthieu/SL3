import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Room } from '@/types/room';
import { roomService } from '@/services/api/rooms';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  streamInfo: {
    [key: string]: {
      streamUrl?: string;
      status: string;
      viewerCount: number;
      startedAt?: string;
      languages: string[];
    };
  };
  
  // Actions
  fetchEventRooms: (eventId: string) => Promise<void>;
  fetchRoom: (eventId: string, roomId: string) => Promise<void>;
  createRoom: (data: any) => Promise<Room>;
  updateRoom: (eventId: string, roomId: string, data: any) => Promise<Room>;
  deleteRoom: (eventId: string, roomId: string) => Promise<void>;
  startStream: (eventId: string, roomId: string) => Promise<void>;
  stopStream: (eventId: string, roomId: string) => Promise<void>;
  fetchStreamInfo: (eventId: string, roomId: string) => Promise<void>;
  reset: () => void;
}

export const useRoomStore = create<RoomState>()(
  devtools(
    (set, get) => ({
      rooms: [],
      currentRoom: null,
      isLoading: false,
      error: null,
      streamInfo: {},

      fetchEventRooms: async (eventId: string) => {
        try {
          set({ isLoading: true, error: null });
          const rooms = await roomService.getEventRooms(eventId);
          set({ rooms, isLoading: false });
        } catch (error) {
          console.error('Error fetching event rooms:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchRoom: async (eventId: string, roomId: string) => {
        try {
          set({ isLoading: true, error: null });
          const room = await roomService.getById(eventId, roomId);
          set({ currentRoom: room, isLoading: false });
        } catch (error) {
          console.error('Error fetching room:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      createRoom: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const room = await roomService.create(data);
          set((state) => ({
            rooms: [...state.rooms, room],
            isLoading: false,
          }));
          return room;
        } catch (error) {
          console.error('Error creating room:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateRoom: async (eventId: string, roomId: string, data) => {
        try {
          set({ isLoading: true, error: null });
          const updatedRoom = await roomService.update(eventId, roomId, data);
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? updatedRoom : room
            ),
            currentRoom:
              state.currentRoom?.id === roomId ? updatedRoom : state.currentRoom,
            isLoading: false,
          }));
          return updatedRoom;
        } catch (error) {
          console.error('Error updating room:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteRoom: async (eventId: string, roomId: string) => {
        try {
          set({ isLoading: true, error: null });
          await roomService.delete(eventId, roomId);
          set((state) => ({
            rooms: state.rooms.filter((room) => room.id !== roomId),
            currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error deleting room:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      startStream: async (eventId: string, roomId: string) => {
        try {
          set({ isLoading: true, error: null });
          const updatedRoom = await roomService.startStream(eventId, roomId);
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? updatedRoom : room
            ),
            currentRoom:
              state.currentRoom?.id === roomId ? updatedRoom : state.currentRoom,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error starting stream:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      stopStream: async (eventId: string, roomId: string) => {
        try {
          set({ isLoading: true, error: null });
          const updatedRoom = await roomService.stopStream(eventId, roomId);
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? updatedRoom : room
            ),
            currentRoom:
              state.currentRoom?.id === roomId ? updatedRoom : state.currentRoom,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error stopping stream:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      fetchStreamInfo: async (eventId: string, roomId: string) => {
        try {
          const info = await roomService.getStreamInfo(eventId, roomId);
          set((state) => ({
            streamInfo: {
              ...state.streamInfo,
              [roomId]: info,
            },
          }));
        } catch (error) {
          console.error('Error fetching stream info:', error);
          set((state) => ({
            error: error.message,
            streamInfo: {
              ...state.streamInfo,
              [roomId]: {
                status: 'error',
                viewerCount: 0,
                languages: [],
              },
            },
          }));
        }
      },

      reset: () => {
        set({
          rooms: [],
          currentRoom: null,
          isLoading: false,
          error: null,
          streamInfo: {},
        });
      },
    }),
    {
      name: 'room-store',
    }
  )
);
