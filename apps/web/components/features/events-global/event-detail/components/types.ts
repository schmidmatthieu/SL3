export type EventStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled' | 'postponed';

export interface EventDescriptionProps {
  description: string;
  startDateTime: string;
  endDateTime: string;
  status: EventStatus;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}
