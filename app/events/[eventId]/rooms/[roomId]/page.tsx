import { events } from '@/lib/data';
import { rooms } from '@/lib/rooms';
import { notFound } from 'next/navigation';
import { RoomDetails } from '@/components/events/room-details';

interface RoomPageProps {
  params: {
    eventId: string;
    roomId: string;
  };
}

export function generateStaticParams() {
  return events.flatMap((event) =>
    rooms.map((room) => ({
      eventId: event.id,
      roomId: room.id,
    }))
  );
}

export default function RoomPage({ params }: RoomPageProps) {
  const event = events.find((e) => e.id === params.eventId);
  const room = rooms.find((r) => r.id === params.roomId);

  if (!event || !room) {
    notFound();
  }

  return <RoomDetails event={event} room={room} />;
}