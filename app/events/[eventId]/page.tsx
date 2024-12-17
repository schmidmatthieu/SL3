'use client';

import { useEffect, use } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { notFound } from 'next/navigation';
import { EventDetails } from '@/components/events/event-details';
import { Skeleton } from '@/components/ui/skeleton';

interface EventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const resolvedParams = use(params);
  const { events, isLoading, error, fetchEvents } = useEvents(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (isLoading) {
    return (
      <div className="container py-6 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-red-500">Error loading event: {error}</div>
      </div>
    );
  }

  const event = events.find((e) => e.id === resolvedParams.eventId);

  if (!event) {
    notFound();
  }

  return <EventDetails event={event} />;
}