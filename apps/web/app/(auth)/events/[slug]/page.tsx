'use client';

import { use, useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS, de, it } from 'date-fns/locale';

import { getAuthToken } from '@/lib/api/auth';
import { useEvent } from '@/hooks/useEvent';
import { Skeleton } from '@/components/core/ui/skeleton';
import { HeroBanner, EventDescription, Timeline, Speakers, Rooms } from '@/components/features/events-global/event-detail/components';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

const locales = {
  fr,
  en: enUS,
  de,
  it,
};

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const { i18n } = useTranslation(['common', 'components/event-detail']);
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const { event, isLoading, isError, error, speakers, rooms } = useEvent(slug);
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
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isError) {
    console.error('Error loading event:', error);
    return notFound();
  }

  if (isLoading || !event) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-[400px] w-full" />
        <div className="container">
          <Skeleton className="h-12 w-1/3 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Debug logs
  console.log('Event page - Event data:', { 
    eventId: event.id,
    speakersCount: event.speakers?.length,
    roomsCount: event.rooms?.length,
    speakers: event.speakers,
    rooms: event.rooms
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroBanner
        event={event}
        onShare={handleShare}
      />
      <EventDescription event={event} />
      <Timeline event={event} />
      <Speakers speakers={speakers} rooms={rooms} />
      <Rooms event={event} />
    </div>
  );
}
