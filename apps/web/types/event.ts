import { Room } from './room';
import { Speaker } from './speaker';

export type EventStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled' | 'postponed';

export interface Event {
  _id?: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  startDateTime: string;
  endDateTime: string;
  imageUrl?: string;
  status: EventStatus;
  location?: string;
  maxParticipants: number;
  currentParticipants: number;
  rooms?: Room[];
  speakers: Speaker[];
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  imageUrl?: string;
  bannerUrl?: string;
  location?: string;
  maxParticipants?: number;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: EventStatus;
  imageUrl?: string;
  bannerUrl?: string;
  location?: string;
  maxParticipants?: number;
}
