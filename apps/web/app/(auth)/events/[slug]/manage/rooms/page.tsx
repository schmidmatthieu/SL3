'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useEvents } from '@/hooks/useEvents';
import { BackButton } from '@/components/core/ui/back-button';
import { ManageRooms } from '@/components/features/events-global/management/rooms/manage-rooms';

export default function RoomsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { currentEvent, fetchEvent } = useEvents(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      console.log('ManageEventPage - Fetching event with slug:', slug);
      if (!slug) {
        setLoading(false);
        return;
      }
      await fetchEvent(slug);
      setLoading(false);
    };
    loadEvent();
  }, [slug, fetchEvent]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentEvent) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-8">Manage Rooms</h1>
      <ManageRooms event={currentEvent} />
    </div>
  );
}
