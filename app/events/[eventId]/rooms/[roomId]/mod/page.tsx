import { notFound } from 'next/navigation';

import { events } from '@/lib/data';
import { rooms } from '@/lib/rooms';
import { ModDashboard } from '@/components/moderation/mod-dashboard';

interface ModPageProps {
  params: {
    eventId: string;
    roomId: string;
  };
}

export function generateStaticParams() {
  return events.flatMap(event =>
    rooms.map(room => ({
      eventId: event.id,
      roomId: room.id,
    }))
  );
}

export default function ModPage({ params }: ModPageProps) {
  const event = events.find(e => e.id === params.eventId);
  const room = rooms.find(r => r.id === params.roomId);

  if (!event || !room) {
    notFound();
  }

  return <ModDashboard event={event} room={room} />;
}
