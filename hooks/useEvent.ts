'use client';

import { useCallback, useEffect, useState } from 'react';

import { Event } from '@/types/event';
import { Room } from '@/types/room';
import { apiRequest } from '@/lib/utils';

const fetchEvent = async (eventId: string): Promise<Event> => {
  try {
    console.log('useEvent: Fetching event with ID:', eventId);
    const { data } = await apiRequest<Event>(`/api/events/${eventId}`);
    console.log('useEvent: Event data received:', data);
    return data;
  } catch (error) {
    console.error('useEvent: Error fetching event:', error);
    throw error;
  }
};

const fetchRooms = async (eventId: string): Promise<Room[]> => {
  try {
    console.log('useEvent: Fetching rooms for event:', eventId);
    const { data } = await apiRequest<Room[]>(`/api/rooms/event/${eventId}`);
    console.log('useEvent: Rooms data received:', data);
    return data;
  } catch (error) {
    console.error('useEvent: Error fetching rooms:', error);
    return [];
  }
};

export function useEvent(eventId?: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadEvent = useCallback(async () => {
    if (!eventId) {
      console.log('useEvent: No eventId provided');
      setEvent(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('useEvent: Starting to load event:', eventId);
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const [eventData, roomsData] = await Promise.all([fetchEvent(eventId), fetchRooms(eventId)]);

      const eventWithRooms = { ...eventData, rooms: roomsData };
      console.log('useEvent: Setting combined event data:', eventWithRooms);
      setEvent(eventWithRooms);
      setIsError(false);
      setError(null);
    } catch (err) {
      console.error('useEvent: Error in loadEvent:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to load event');
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Fonction de rafraîchissement exposée
  const refresh = useCallback(() => {
    console.log('useEvent: Refreshing data');
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) {
        await loadEvent();
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [loadEvent, refreshKey]); // Ajout de refreshKey comme dépendance

  return { event, isLoading, isError, error, refresh };
}
