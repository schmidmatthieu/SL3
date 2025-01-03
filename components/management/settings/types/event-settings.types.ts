import { Event } from '@/types/event';

export interface EventSettingsProps {
  event: Event;
}

export interface EventFormData {
  title: string;
  description: string;
  imageUrl: string;
  startDateTime: Date | null;
  endDateTime: Date | null;
  featured: boolean;
}

export interface EventUpdateData {
  title: string;
  description: string;
  imageUrl?: string;
  startDateTime: string;
  endDateTime: string;
  featured: boolean;
}
