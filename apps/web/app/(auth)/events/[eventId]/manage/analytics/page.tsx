'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useEvents } from '@/hooks/useEvents';
import { BackButton } from '@/components/core/ui/back-button';
import { ViewAnalytics } from '@/components/features/events-global/management/analytics/view-analytics';

export default function AnalyticsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { currentEvent, fetchEvent } = useEvents(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      await fetchEvent(eventId);
      setLoading(false);
    };
    loadEvent();
  }, [eventId, fetchEvent]);

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-8">View Analytics</h1>
      <ViewAnalytics />
    </div>
  );
}
