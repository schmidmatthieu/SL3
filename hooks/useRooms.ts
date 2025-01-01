'use client';

import { useEffect } from 'react';
import { useRoomStore } from '@/store/room.store';
import { Room, RoomSettings } from '@/types/room';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { getAuthHeaders } from '@/services/api/utils';

interface UseRoomsResult {
  rooms: Room[];
  isLoading: boolean;
  error: Error | null;
  createRoom: (eventId: string, name: string, settings: RoomSettings, options: {
    description?: string;
    thumbnail?: string;
    startTime: string;
    endTime: string;
  }) => Promise<Room>;
  updateRoom: (roomId: string, data: Partial<Room>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  endRoom: (roomId: string) => Promise<void>;
  pauseRoom: (roomId: string) => Promise<void>;
  cancelRoom: (roomId: string) => Promise<void>;
  reactivateRoom: (roomId: string) => Promise<void>;
  startStream: (roomId: string) => Promise<void>;
  stopStream: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useRooms(eventId?: string): UseRoomsResult {
  const { toast } = useToast();
  const {
    rooms,
    loading: isLoading,
    error,
    fetchEventRooms,
    createRoom: createRoomStore,
    updateRoom: updateRoomStore,
    deleteRoom: deleteRoomStore,
  } = useRoomStore();

  useEffect(() => {
    if (eventId) {
      fetchEventRooms(eventId);
    }
  }, [eventId, fetchEventRooms]);

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const createRoom = async (
    eventId: string,
    name: string,
    settings: RoomSettings,
    options: {
      description?: string;
      thumbnail?: string;
      startTime: string;
      endTime: string;
    }
  ) => {
    try {
      const newRoom = await createRoomStore({
        name,
        eventId,
        description: options.description || '',
        thumbnail: options.thumbnail || '',
        startTime: options.startTime,
        endTime: options.endTime,
        settings: {
          ...settings,
          maxParticipants: settings.maxParticipants || 100,
          originalLanguage: settings.originalLanguage || 'en',
          availableLanguages: settings.availableLanguages || []
        }
      });
      
      toast({
        title: "Success",
        description: "Room created successfully",
      });

      return newRoom;
    } catch (error) {
      handleError(error, 'Failed to create room');
      throw error;
    }
  };

  const updateRoom = async (roomId: string, data: Partial<Room>) => {
    try {
      await updateRoomStore(eventId!, roomId, data);
    } catch (error) {
      handleError(error, 'Failed to update room');
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      await deleteRoomStore(eventId!, roomId);
    } catch (error) {
      handleError(error, 'Failed to delete room');
    }
  };

  const endRoom = async (roomId: string) => {
    try {
      await updateRoom(roomId, { status: 'ended' });
    } catch (error) {
      handleError(error, 'Failed to end room');
    }
  };

  const pauseRoom = async (roomId: string) => {
    try {
      await updateRoom(roomId, { status: 'paused' });
    } catch (error) {
      handleError(error, 'Failed to pause room');
    }
  };

  const cancelRoom = async (roomId: string) => {
    try {
      await updateRoom(roomId, { status: 'cancelled' });
    } catch (error) {
      handleError(error, 'Failed to cancel room');
    }
  };

  const reactivateRoom = async (roomId: string) => {
    try {
      await updateRoom(roomId, { status: 'upcoming' });
    } catch (error) {
      handleError(error, 'Failed to reactivate room');
    }
  };

  const startStream = async (roomId: string) => {
    try {
      await updateRoom(roomId, { status: 'live' });
    } catch (error) {
      handleError(error, 'Failed to start stream');
    }
  };

  const stopStream = async (roomId: string) => {
    try {
      await updateRoom(roomId, { status: 'ended' });
    } catch (error) {
      handleError(error, 'Failed to stop stream');
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      // Force revalidation and update the cache with fresh data
      await fetchEventRooms(eventId!);

    } catch (error) {
      handleError(error, 'Failed to join room');
    }
  };

  const leaveRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to leave room');
      }

      // Force revalidation and update the cache with fresh data
      await fetchEventRooms(eventId!);

    } catch (error) {
      handleError(error, 'Failed to leave room');
    }
  };

  return {
    rooms,
    isLoading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    endRoom,
    pauseRoom,
    cancelRoom,
    reactivateRoom,
    startStream,
    stopStream,
    joinRoom,
    leaveRoom,
  };
}
