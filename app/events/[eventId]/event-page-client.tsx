'use client';

import { useEffect } from 'react';
import { useEvent } from '@/hooks/useEvent';
import { notFound } from 'next/navigation';
import { EventDetails } from '@/components/events/event-details';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';

interface EventPageClientProps {
  eventId: string;
}

export default function EventPageClient({ eventId }: EventPageClientProps) {
  const router = useRouter();
  const { event, isLoading, isError } = useEvent(eventId);

  useEffect(() => {
    console.log('EventPage client component mounted');
    console.log('Event ID:', eventId);
    console.log('Current event:', event);
  }, [eventId, event]);

  if (!getAuthToken()) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-500">Please log in to view this event</div>
          <Button 
            onClick={() => router.push('/login')}
            variant="default"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError || !event) {
    console.error('Event not found or error occurred');
    notFound();
    return null;
  }

  return (
    <div className="container py-6">
      <EventDetails event={event} />
    </div>
  );
}
