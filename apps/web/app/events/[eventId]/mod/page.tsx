import { notFound } from 'next/navigation';

import { events } from '@/lib/data';
import { EventModDashboard } from '@/components/moderation/event-mod-dashboard';

interface EventModPageProps {
  params: {
    eventId: string;
  };
}

export function generateStaticParams() {
  return events.map(event => ({
    eventId: event.id,
  }));
}

export default function EventModPage({ params }: EventModPageProps) {
  const event = events.find(e => e.id === params.eventId);

  if (!event) {
    notFound();
  }

  return <EventModDashboard event={event} />;
}
