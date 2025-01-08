'use client';

import { useEffect, useState } from 'react';
import { useEventStore } from '@/lib/store/event.store';

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

export function useRoom(eventSlug: string, roomSlug: string): UseRoomResult {
  const { currentEvent, isLoading: isEventLoading, fetchEvent } = useEventStore();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      if (!eventSlug || !roomSlug) {
        setError('Invalid event or room slug');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Only fetch event if we don't have it or if it's a different event
        if (!currentEvent || currentEvent.slug !== eventSlug) {
          await fetchEvent(eventSlug);
        }

        // Find room in current event
        if (currentEvent?.rooms) {
          const room = currentEvent.rooms.find(r => r.slug === roomSlug);
          if (room) {
            setCurrentRoom(room);
            // Update stream info if room is live
            if (room.status === 'live') {
              setStreamInfo({
                viewerCount: Math.floor(Math.random() * 100) + 50,
                streamUrl: room.streamUrl,
              });
            } else {
              setStreamInfo(null);
            }
          } else {
            setError('Room not found');
            setCurrentRoom(null);
            setStreamInfo(null);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load room';
        setError(errorMessage);
        setCurrentRoom(null);
        setStreamInfo(null);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    // Only run initialization once or when slugs change
    if (!hasInitialized || (eventSlug && roomSlug)) {
      loadRoom();
    }
  }, [eventSlug, roomSlug, currentEvent?.slug, hasInitialized]);

  return {
    currentRoom,
    isLoading: isLoading || isEventLoading,
    error,
    streamInfo,
  };
}
