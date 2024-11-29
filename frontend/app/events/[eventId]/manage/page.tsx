import { events } from '@/lib/data';
import { notFound } from 'next/navigation';
import { EventManagement } from '@/components/management/event-management';

interface EventManagePageProps {
  params: {
    eventId: string;
  };
}

export function generateStaticParams() {
  return events.map((event) => ({
    eventId: event.id,
  }));
}

export default function EventManagePage({ params }: EventManagePageProps) {
  const event = events.find((e) => e.id === params.eventId);

  if (!event) {
    notFound();
  }

  return <EventManagement event={event} />;
}