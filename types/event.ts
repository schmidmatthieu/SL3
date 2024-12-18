export type EventStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

export interface Event {
  id?: string;  // Pour la compatibilité avec l'ancien code
  _id: string;  // ID MongoDB principal
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