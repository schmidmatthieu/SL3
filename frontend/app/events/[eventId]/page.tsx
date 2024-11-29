import { events } from '@/lib/data';
import { EventDetails } from '@/components/events/event-details';
import { notFound } from 'next/navigation';

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export function generateStaticParams() {
  return events.map((event) => ({
    eventId: event.id,
  }));
}

export default function EventPage({ params }: EventPageProps) {
  const event = events.find((e) => e.id === params.eventId);

  if (!event) {
    notFound();
  }

  return <EventDetails event={event} />;
}