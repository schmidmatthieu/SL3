'use client';

import { useCallback, useEffect, useState } from 'react';

import { Event } from '@/types/event';
import { Room } from '@/types/room';
import { Speaker } from '@/types/speaker'; // Ajout de l'importation du type Speaker
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
  console.log('useEvent: Fetching rooms for event:', eventId);
  try {
    const response = await apiRequest<Room[]>(`/api/rooms/event/${eventId}`);
    const data = response.data;
    console.log('useEvent: Raw rooms data:', JSON.stringify(data, null, 2));
    
    // S'assurer que chaque room a un ID et un eventId
    const processedData = data.map(room => ({
      ...room,
      id: room.id || room._id,
      eventId: room.eventId || eventId
    }));
    
    console.log('useEvent: Processed rooms data:', JSON.stringify(processedData, null, 2));
    return processedData;
  } catch (error) {
    console.error('useEvent: Error fetching rooms:', error);
    return [];
  }
};

const fetchSpeakers = async (eventId: string): Promise<Speaker[]> => {
  console.log('useEvent: Fetching speakers for event:', eventId);
  try {
    const response = await apiRequest<Speaker[]>(`/api/events/${eventId}/speakers`);
    const data = response.data;
    console.log('useEvent: Raw speakers data:', JSON.stringify(data, null, 2));
    
    // S'assurer que chaque speaker a un ID et un eventId
    const processedData = data.map(speaker => ({
      ...speaker,
      id: speaker.id || speaker._id,
      eventId: speaker.eventId || eventId
    }));
    
    console.log('useEvent: Processed speakers data:', JSON.stringify(processedData, null, 2));
    return processedData;
  } catch (error) {
    console.error('useEvent: Error fetching speakers:', error);
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
      setIsLoading(false);
      setIsError(true);
      setError('No event ID provided');
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const [eventData, roomsData, speakersData] = await Promise.all([
        fetchEvent(eventId),
        fetchRooms(eventId),
        fetchSpeakers(eventId)
      ]);

      // S'assurer que les dates sont correctement formatées
      const formattedEvent = {
        ...eventData,
        startDateTime: eventData.startDateTime ? new Date(eventData.startDateTime).toISOString() : null,
        endDateTime: eventData.endDateTime ? new Date(eventData.endDateTime).toISOString() : null,
        rooms: roomsData,
        speakers: speakersData
      };

      console.log('useEvent: Formatted event data:', formattedEvent);
      setEvent(formattedEvent);
      setIsLoading(false);
    } catch (err) {
      console.error('useEvent: Error in loadEvent:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
