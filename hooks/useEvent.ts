'use client';

import useSWR from 'swr';
import { apiRequest } from '@/lib/utils';
import { Event } from '@/types/event';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Room } from '@/types/room';
import { useEffect } from 'react';

const fetchEvent = async (url: string) => {
  try {
    const { data } = await apiRequest<Event>(url);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        throw new Error('Please log in to view this event');
      }
      throw new Error(`Failed to load event: ${error.message}`);
    }
    throw error;
  }
};

const fetchRooms = async (eventId: string) => {
  try {
    const { data } = await apiRequest<Room[]>(`/api/rooms/event/${eventId}`);
    return data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

export function useEvent(eventId: string) {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: event, error: eventError, isLoading: eventLoading, mutate: mutateEvent } = useSWR<Event>(
    eventId && user ? `/api/events/${eventId}` : null,
    fetchEvent,
    {
      onError: (err) => {
        if (err.message === 'Please log in to view this event') {
          router.push('/login');
        }
      },
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      shouldRetryOnError: (err) => {
        return !(err.message === 'Please log in to view this event');
      }
    }
  );

  const { data: rooms, error: roomsError, isLoading: roomsLoading, mutate: mutateRooms } = useSWR<Room[]>(
    event ? `/api/rooms/event/${eventId}` : null,
    () => fetchRooms(eventId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  );

  const combinedEvent = event && rooms ? {
    ...event,
    rooms: rooms
  } : null;

  const isLoading = eventLoading || roomsLoading;
  const error = eventError?.message || roomsError?.message;

  const mutate = async () => {
    await Promise.all([mutateEvent(), mutateRooms()]);
  };

  return {
    event: combinedEvent,
    isLoading,
    isError: error,
    mutate,
  };
}
