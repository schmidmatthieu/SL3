export type EventStatus = 'live' | 'upcoming' | 'ended';

export interface Event {
  id: string;
  title: string;
  date: string;
  rooms: number;
  status: EventStatus;
  imageUrl: string;
  venue: string;
}