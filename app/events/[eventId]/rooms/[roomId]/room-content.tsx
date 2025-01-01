'use client';

import { RoomDetails } from '@/components/events/room-details';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useEventStore } from '@/store/event.store';
import { Skeleton } from '@/components/ui/skeleton';

interface RoomContentProps {
  eventId: string;
  roomId: string;
}

export function RoomContent({ eventId, roomId }: RoomContentProps) {
  const router = useRouter();
  const { event, isLoading, error, fetchEvent } = useEventStore();

  useEffect(() => {
    console.log('RoomContent mounted with:', { eventId, roomId });
    if (eventId) {
      console.log('Fetching event:', eventId);
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent]);

  useEffect(() => {
    if (error) {
      console.error('Error loading event:', error);
      router.push('/events');
    }
  }, [error, router]);

  console.log('Current state:', { event, isLoading, error });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-video w-full" />
          </div>
          <div>
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    console.log('No event data available');
    return (
      <div className="container py-8">
        <p>Loading event data...</p>
      </div>
    );
  }

  const room = event.rooms.find(r => r.id === roomId);
  console.log('Found room:', room);
  
  if (!room) {
    console.log('Room not found, redirecting...');
    router.push(`/events/${eventId}`);
    return (
      <div className="container py-8">
        <p>Room not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <RoomDetails event={event} roomId={roomId} />
    </main>
  );
}
