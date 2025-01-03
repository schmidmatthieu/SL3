import { Event } from '@/types/event';

export type EventStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

export function calculateEventStatus(
  startDateTime: string | Date,
  endDateTime: string | Date,
  currentStatus?: EventStatus
): EventStatus {
  // Si l'événement est déjà annulé, garder ce statut
  if (currentStatus === 'cancelled') {
    return 'cancelled';
  }

  const now = new Date();
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (now < start) return 'scheduled';
  if (now > end) return 'ended';
  return 'active';
}
