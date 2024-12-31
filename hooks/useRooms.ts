'use client';

import { useState, useEffect } from 'react';
import { Room, RoomSettings, RoomStatus } from '@/types/room';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth-store';
import useSWR from 'swr';

interface UseRoomsResult {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  createRoom: (
    eventId: string,
    name: string,
    settings: Partial<RoomSettings>,
    extraData?: {
      description?: string;
      thumbnail?: string;
      startTime?: string;
      endTime?: string;
    }
  ) => Promise<void>;
  updateRoom: (roomId: string, data: Partial<Room>) => Promise<void>;
  deleteRoom: (eventId: string, roomId: string) => Promise<void>;
  startStream: (roomId: string) => Promise<void>;
  stopStream: (roomId: string) => Promise<void>;
  pauseStream: (roomId: string) => Promise<void>;
  cancelRoom: (roomId: string) => Promise<void>;
  reactivateRoom: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  endRoom: (roomId: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const fetcher = async (url: string) => {
  console.log('Fetching rooms from:', url);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    console.error('Failed to fetch rooms:', response.status, response.statusText);
    throw new Error('Failed to fetch rooms');
  }
  const data = await response.json();
  console.log('Fetched rooms:', data);
  return data;
};

export function useRooms(eventId?: string): UseRoomsResult {
  const { toast } = useToast();
  
  console.log('useRooms hook called with eventId:', eventId);
  
  const { data: rooms = [], error, isLoading, mutate } = useSWR<Room[]>(
    eventId ? `/api/rooms/event/${eventId}` : null,
    fetcher
  );

  console.log('useRooms hook state:', { rooms, error, isLoading });

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
    throw error;
  };

  const createRoom = async (
    eventId: string,
    name: string,
    settings: Partial<RoomSettings>,
    extraData?: {
      description?: string;
      thumbnail?: string;
      startTime?: string;
      endTime?: string;
    }
  ) => {
    try {
      const response = await fetch(`/api/rooms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          eventId,
          name,
          settings,
          ...extraData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to create room');
    }
  };

  const updateRoom = async (roomId: string, data: Partial<Room>) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update room');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to update room');
    }
  };

  const deleteRoom = async (eventId: string, roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete room');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to delete room');
    }
  };

  const startStream = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/stream`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to start stream');
    }
  };

  const stopStream = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/stream/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to stop stream');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to stop stream');
    }
  };

  const pauseStream = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/stream/pause`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to pause stream');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to pause stream');
    }
  };

  const cancelRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel room');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to cancel room');
    }
  };

  const reactivateRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/reactivate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate room');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to reactivate room');
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

      mutate();
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

      mutate();
    } catch (error) {
      handleError(error, 'Failed to leave room');
    }
  };

  const endRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/end`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to end room');
      }

      mutate();
    } catch (error) {
      handleError(error, 'Failed to end room');
    }
  };

  return {
    rooms,
    isLoading,
    error: error ? error.message : null,
    createRoom,
    updateRoom,
    deleteRoom,
    startStream,
    stopStream,
    pauseStream,
    cancelRoom,
    reactivateRoom,
    joinRoom,
    leaveRoom,
    endRoom,
  };
}
