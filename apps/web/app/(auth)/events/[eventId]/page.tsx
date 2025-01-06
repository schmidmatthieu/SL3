'use client';

import { use, useEffect, useState } from 'react';
import { Metadata } from 'next';
import { notFound, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, de, it } from 'date-fns/locale';

import { getAuthToken } from '@/lib/api/auth';
import { getEventById } from '@/lib/api/events';
import { getEventMetadata } from '@/lib/metadata';
import { useEventStore } from '@/lib/store/event.store';
import { useEvent } from '@/hooks/useEvent';
import { Skeleton } from '@/components/core/ui/skeleton';
import { Button } from '@/components/core/ui/button';
import { HeroBanner, EventDescription, Timeline, Speakers, Rooms } from '@/components/features/events-global/event-detail/components';

interface EventPageProps {
  params: Promise<{ eventId: string }>;
}

const locales = {
  fr,
  en: enUS,
  de,
  it,
};

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const { i18n, t } = useTranslation(['common', 'components/event-detail']);
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const { event, isLoading, isError, error } = useEvent(eventId);
  const locale = locales[i18n.language as keyof typeof locales] || enUS;

  useEffect(() => {
    const authToken = getAuthToken();
    if (!authToken) {
      setIsAuthenticated(false);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback - Copier le lien dans le presse-papier
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isAuthenticated) {
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
      <div className="space-y-8">
        <Skeleton className="w-full h-[60vh]" />
        <div className="container">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    console.error('EventPage: Error or no event found', { isError, error, event });
    return notFound();
  }

  return (
    <main className="min-h-screen">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : isError ? (
        <div className="text-center py-8">
          <p className="text-red-500">{t('error.loading_event')}</p>
        </div>
      ) : event ? (
        <>
          <HeroBanner
            title={event.title}
            imageUrl={event.imageUrl || '/images/default-event-banner.jpg'}
            date={format(new Date(event.startDateTime), 'PPP', { locale })}
            location={event.location || t('common:virtual')}
            onRegister={() => {/* Implémenter la logique d'inscription */}}
            onShare={handleShare}
          />
          <div className="container mx-auto px-4 py-8 space-y-8">
            <EventDescription
              description={event.description}
              startDateTime={event.startDateTime}
              endDateTime={event.endDateTime}
              status={event.status}
            />
            {event.startDateTime && event.endDateTime && (
              <Timeline event={event} />
            )}
            <Speakers speakers={event.speakers || []} rooms={event.rooms || []} />
            <Rooms event={event} />
          </div>
        </>
      ) : null}
    </main>
  );
}
