'use client';

import { useEffect, use, useState } from 'react';
import { useEvent } from '@/hooks/useEvent';
import { notFound } from 'next/navigation';
import { EventDetails } from '@/components/events/event-details';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';

interface EventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  const { event, isLoading, isError, error } = useEvent(eventId);

  useEffect(() => {
    const authToken = getAuthToken();
    if (!authToken) {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    console.log('EventPage: Component mounted');
    console.log('EventPage: Event ID:', eventId);
    console.log('EventPage: Event data:', event);
    console.log('EventPage: Loading state:', isLoading);
    console.log('EventPage: Error state:', { isError, error });
  }, [eventId, event, isLoading, isError, error]);

  if (!isAuthenticated) {
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
        <div className="animate-pulse rounded-md bg-muted h-[300px] w-full" />
      </div>
    );
  }

  if (isError || !event) {
    console.error('EventPage: Error or no event found', { isError, error, event });
    return notFound();
  }

  console.log('EventPage: Rendering event details', event);
  return (
    <div className="container py-6">
      <EventDetails event={event} />
    </div>
  );
}