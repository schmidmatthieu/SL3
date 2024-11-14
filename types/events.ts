export type EventAccessType = 'public' | 'registration' | 'paid';

export interface EventFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  accessType: EventAccessType;
  price?: number;
  languages: string[];
  moderators: string[];
}

export interface RoomFormData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  speakers: string[];
  languages: string[];
  streamKey?: string;
}

export interface EventWithRooms {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  accessType: EventAccessType;
  price?: number;
  languages: string[];
  moderators: string[];
  rooms: Room[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  eventId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  speakers: string[];
  languages: string[];
  streamKey?: string;
  playbackId?: string;
  createdAt: Date;
  updatedAt: Date;
}