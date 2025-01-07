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

export function useRoom(eventId: string, roomId: string): UseRoomResult {
  const { currentEvent, isLoading: isEventLoading, fetchEvent } = useEventStore();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      if (!eventId || !roomId) {
        setError('Invalid event or room ID');
        setIsLoading(false);
        return;
      }

      try {
        if (!currentEvent || currentEvent.id !== eventId) {
          await fetchEvent(eventId);
        }

        if (currentEvent && currentEvent.rooms) {
            availableRooms: currentEvent.rooms.map(r => ({ id: r.id, name: r.name }))
          });
          const room = currentEvent.rooms.find(r => r.id === roomId);
          if (room) {
            setCurrentRoom(room);
            if (room.status === 'live') {
              setStreamInfo({
                viewerCount: Math.floor(Math.random() * 100) + 50,
                streamUrl: room.streamUrl,
              });
            }
            setError(null);
          } else {
            setError('Salle non trouvée');
            setCurrentRoom(null);
          }
        } else {
          setError('Aucune salle disponible');
          setCurrentRoom(null);
        }
      } catch (err) {
        console.error('Error in useRoom:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la salle');
        setCurrentRoom(null);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadRoom();
  }, [eventId, roomId, currentEvent, fetchEvent]);

  return {
    currentRoom,
    isLoading: isLoading || isEventLoading,
    error,
    streamInfo,
  };
}
