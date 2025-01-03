'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import cn from 'classnames'; // Added classnames import

import { useEvents } from '@/hooks/useEvents';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '@/components/ui/back-button';
import { Skeleton } from '@/components/ui/skeleton';
import { EventSettings } from '@/components/management/settings/event-settings';
import { EventStatusBadge } from '@/components/events/status/event-status-badge';

export default function SettingsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { currentEvent, fetchEvent, isLoading, error } = useEvents(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        if (eventId) {
          await fetchEvent(eventId);
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadEvent();
  }, [eventId, fetchEvent]);

  if (isLoading || isInitialLoad) {
    return (
      <div className="responsive-container py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="responsive-container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="responsive-container py-8">
        <Alert>
          <AlertDescription>Event not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="responsive-container py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <BackButton />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{currentEvent.title}</h1>
              <p className="text-muted-foreground">
                Gérez les paramètres et les détails de votre événement
              </p>
            </div>
          </div>
          <EventStatusBadge event={currentEvent} className="text-sm font-medium" />
        </div>
      </div>
      <EventSettings event={currentEvent} />
    </div>
  );
}
