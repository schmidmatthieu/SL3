'use client';

import { useCallback, useEffect, useState } from 'react';

import { Event } from '@/types/event';
import { Room } from '@/types/room';
import { Speaker } from '@/types/speaker';
import { apiRequest } from '@/lib/utils';
import { API_CONFIG } from '@/lib/config/api.config';

const fetchEvent = async (idOrSlug: string): Promise<Event> => {
  try {
    
    const { data } = await apiRequest<Event>(`${API_CONFIG.endpoints.events}/${idOrSlug}`);    
    
    if (!data) {
      throw new Error('No event data received');
    } 

    return {
      ...data,
      id: data.id || data._id,
      slug: data.slug,
      startDateTime: data.startDateTime || data.startDate,
      endDateTime: data.endDateTime || data.endDate,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      location: data.location || '',
      maxParticipants: data.maxParticipants || 0,
      participants: data.participants || [],
      speakers: data.speakers || [],
      rooms: data.rooms || [],
      status: data.status || 'draft'
    };
  } catch (error) {    
    throw error;
  }
};

const fetchRooms = async (eventSlug: string): Promise<Room[]> => {  
  try {
    const response = await apiRequest<Room[]>(`${API_CONFIG.endpoints.rooms}/event/${eventSlug}`);
    if (!response || !response.data) {      
      return [];
    }
    
    const data = response.data;    
    
    const processedData = data.map(room => ({
      ...room,
      id: room.id || room._id,
      eventId: room.eventId,
      slug: room.slug || room.id || room._id,
      speakers: room.speakers || [],
      participants: room.participants || [],
      status: room.status || 'draft',
      startTime: room.startTime || room.startDateTime || '',
      endTime: room.endTime || room.endDateTime || '',
      settings: {
        ...room.settings,
        originalLanguage: room.settings?.originalLanguage || 'fr',
        availableLanguages: room.settings?.availableLanguages || []
      }
    }));
    
    
    return processedData;
  } catch (error) {
    
    return [];
  }
};

const fetchSpeakers = async (eventSlug: string): Promise<Speaker[]> => {
  
  try {
    const response = await apiRequest<Speaker[]>(`${API_CONFIG.endpoints.events}/${eventSlug}/speakers`);
    if (!response || !response.data) {
      
      return [];
    }
    
    const data = response.data;
    
    
    const processedData = data.map(speaker => ({
      ...speaker,
      id: speaker.id || speaker._id,
      eventId: speaker.eventId,
      fullName: speaker.fullName || speaker.name || '',
      role: speaker.role || '',
      company: speaker.company || '',
      bio: speaker.bio || '',
      imageUrl: speaker.imageUrl || '',
      rooms: speaker.rooms || []
    }));
    
    
    return processedData;
  } catch (error) {
    
    return [];
  }
};

export function useEvent(idOrSlug?: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    if (!idOrSlug) {
      setError('No event ID or slug provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eventData = await fetchEvent(idOrSlug);
      setEvent(eventData);

      // Utiliser le slug de l'événement pour charger les rooms
      const roomsData = await fetchRooms(eventData.slug);
      setRooms(roomsData);

      const speakersData = await fetchSpeakers(eventData.slug);
      setSpeakers(speakersData);
    } catch (err: any) {      
      setError(err.message || 'Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  return { event, rooms, speakers, isLoading, error, refetch: loadEvent };
}
