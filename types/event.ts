import { Room } from './room';
import { Speaker } from './speaker';

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
  location?: string; // Optional location field for virtual or physical events
  rooms: Room[];
  speakers: Speaker[];
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
