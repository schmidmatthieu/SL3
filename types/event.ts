import { Room } from './room';

export type EventStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled' | 'postponed';

export interface Event {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  status: EventStatus;
  imageUrl?: string;
  rooms: Room[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  imageUrl?: string;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: EventStatus;
  imageUrl?: string;
}
