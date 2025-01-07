'use client';

import { useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';

import { getAuthToken } from '@/lib/api/auth';
import { useEvent } from '@/hooks/useEvent';
import { Button } from '@/components/core/ui/button';
import { Skeleton } from '@/components/core/ui/skeleton';
import { EventDetails } from '@/components/event/event-details';

interface EventPageClientProps {
  eventId: string;
}

export default function EventPageClient({ eventId }: EventPageClientProps) {
  const router = useRouter();
  const { event, isLoading, isError } = useEvent(eventId);

  useEffect(() => {    
  }, [eventId, event]);

  if (!getAuthToken()) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-500">Please log in to view this event</div>
          <Button onClick={() => router.push('/login')} variant="default">
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
