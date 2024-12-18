import { SpeakerManagement } from '@/components/management/speakers/speaker-management';
import { use } from 'react';

interface Room {
  id: string;
  name: string;
}

// Cette fonction devra être remplacée par une vraie requête à votre API
async function getRooms(eventId: string): Promise<Room[]> {
  // Simuler des données pour l'exemple
  return [
    { id: '1', name: 'Main Hall' },
    { id: '2', name: 'Workshop Room' },
    { id: '3', name: 'Conference Room' },
  ];
}

export default function SpeakersPage({
  params,
}: {
  params: { eventId: string };
}) {
  const resolvedParams = use(params);
  const rooms = use(getRooms(resolvedParams.eventId));

  return <SpeakerManagement eventId={resolvedParams.eventId} rooms={rooms} />;
}
