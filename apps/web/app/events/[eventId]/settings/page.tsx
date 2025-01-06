'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '@/components/ui/back-button';
import { EventSettings } from '@/components/management/settings/event-settings';
import { EventStatusBadge } from '@/components/events/status/event-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents } from '@/hooks/useEvents';

import type { Event } from '@/types/event';

const LoadingState = (): JSX.Element => (
  <div className="responsive-container py-8">
    <Skeleton className="h-8 w-64 mb-6" />
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }): JSX.Element => (
  <div className="responsive-container py-8">
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  </div>
);

const NotFoundState = ({ message }: { message: string }): JSX.Element => (
  <div className="responsive-container py-8">
    <Alert>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  </div>
);

const EventHeader = ({ event }: { event: Event }): JSX.Element => {
  const { t } = useTranslation('management/settings/event-settings');
  
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <BackButton />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">
              {t('eventSettings.page.description')}
            </p>
          </div>
        </div>
        <EventStatusBadge event={event} className="text-sm font-medium" />
      </div>
    </div>
  );
};

export default function SettingsPage(): JSX.Element {
  const params = useParams();
  const eventId = params.eventId as string;
  const { currentEvent, fetchEvent, isLoading, error } = useEvents(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { t } = useTranslation('management/settings/event-settings');

  useEffect(() => {
    const loadEvent = async (): Promise<void> => {
      try {
        if (eventId && eventId.length > 0) {
          await fetchEvent(eventId);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error loading event:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    void loadEvent();
  }, [eventId, fetchEvent]);

  if (isLoading || isInitialLoad) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!currentEvent) {
    return <NotFoundState message={t('eventSettings.page.notFound')} />;
  }

  return (
    <div className="responsive-container py-8">
      <EventHeader event={currentEvent} />
      <EventSettings event={currentEvent} />
    </div>
  );
}
