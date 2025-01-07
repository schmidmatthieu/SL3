'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useEvents } from '@/hooks/useEvents';
import { useRoomStore } from '@/lib/store/room.store';
import { BackButton } from '@/components/core/ui/back-button';
import { SpeakerManagement } from '@/components/features/events-global/management/speakers/speaker-management';
import { useToast } from '@/components/core/ui/use-toast';

interface Room {
  id: string;
  name: string;
}

export default function SpeakersPage() {
  const { t } = useTranslation('components/event-manage');
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug as string;
  const { currentEvent, fetchEvent } = useEvents(false);
  const { rooms, fetchEventRooms } = useRoomStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!slug) {
          toast({
            title: 'Error',
            description: 'Event not found',
            variant: 'destructive',
          });
          router.push('/events');
          return;
        }

        await Promise.all([
          fetchEvent(slug),
          fetchEventRooms(slug)
        ]);
        setLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load event data',
          variant: 'destructive',
        });
        router.push('/events');
      }
    };
    loadData();
  }, [slug, fetchEvent, fetchEventRooms, router, toast]);

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        {t('speakers.title')}
      </h1>
      <SpeakerManagement event={currentEvent} rooms={rooms} />
    </div>
  );
}
