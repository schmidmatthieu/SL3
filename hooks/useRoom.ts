'use client';

import { useEffect, useState } from 'react';
import { useEventStore } from '@/store/event.store';

import { Room } from '@/types/room';

interface StreamInfo {
  viewerCount: number;
  streamUrl?: string;
}

interface UseRoomResult {
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  streamInfo: StreamInfo | null;
}

export function useRoom(eventId: string, roomId: string): UseRoomResult {
  const { event, isLoading: isEventLoading } = useEventStore();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);

  useEffect(() => {
    if (!isEventLoading && event) {
      setIsLoading(true);
      try {
        if (!event.rooms) {
          setError('No rooms available');
          setCurrentRoom(null);
        } else {
          const room = event.rooms.find(r => r.id === roomId);
          if (room) {
            setCurrentRoom(room);
            // Simuler des informations de streaming pour les rooms en direct
            if (room.status === 'live') {
              setStreamInfo({
                viewerCount: Math.floor(Math.random() * 100) + 50,
                streamUrl: room.streamUrl,
              });
            }
            setError(null);
          } else {
            setError('Room not found');
            setCurrentRoom(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCurrentRoom(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [event, eventId, roomId, isEventLoading]);

  return {
    currentRoom,
    isLoading: isLoading || isEventLoading,
    error,
    streamInfo,
  };
}
