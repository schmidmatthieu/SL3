'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useEvents } from '@/hooks/useEvents';
import { useRoomStore } from '@/lib/store/room.store';
import { BackButton } from '@/components/core/ui/back-button';
import { SpeakerManagement } from '@/components/features/events-global/management/speakers/speaker-management';

interface Room {
  id: string;
  name: string;
}

export default function SpeakersPage() {
  const { t } = useTranslation('components/event-manage');
  const params = useParams();
  const eventId = params.eventId as string;
  const { currentEvent, fetchEvent } = useEvents(false);
  const { rooms, fetchEventRooms } = useRoomStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchEvent(eventId),
        fetchEventRooms(eventId)
      ]);
      setLoading(false);
    };
    loadData();
  }, [eventId, fetchEvent, fetchEventRooms]);

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t('speakers.title')}</h1>
      <SpeakerManagement eventId={eventId} rooms={rooms} />
    </div>
  );
}
