export type EventStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled' | 'postponed';

export interface EventDescriptionProps {
  description?: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
  status?: EventStatus;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}
