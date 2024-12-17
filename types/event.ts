export type EventStatus = 'active' | 'scheduled' | 'ended';

export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  imageUrl?: string;
  status: EventStatus;
  rooms: number;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}