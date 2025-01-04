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
  const { currentEvent, isLoading: isEventLoading, fetchEvent } = useEventStore();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      if (!eventId || !roomId) {
        console.log('useRoom: Invalid IDs', { eventId, roomId });
        setError('Invalid event or room ID');
        setIsLoading(false);
        return;
      }

      try {
        console.log('useRoom: Loading room data', { eventId, roomId, currentEvent });
        if (!currentEvent || currentEvent.id !== eventId) {
          console.log('useRoom: Fetching event');
          await fetchEvent(eventId);
          console.log('useRoom: Event fetched', { currentEvent });
        }

        if (currentEvent && currentEvent.rooms) {
          console.log('useRoom: Looking for room in event rooms', { 
            availableRooms: currentEvent.rooms.map(r => ({ id: r.id, name: r.name }))
          });
          const room = currentEvent.rooms.find(r => r.id === roomId);
          if (room) {
            console.log('useRoom: Room found', { room });
            setCurrentRoom(room);
            if (room.status === 'live') {
              setStreamInfo({
                viewerCount: Math.floor(Math.random() * 100) + 50,
                streamUrl: room.streamUrl,
              });
            }
            setError(null);
          } else {
            console.log('useRoom: Room not found', { roomId });
            setError('Salle non trouvée');
            setCurrentRoom(null);
          }
        } else {
          console.log('useRoom: No rooms available', { currentEvent });
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
