import { EventStatus } from '../schemas/event.schema';

export class EventResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  imageUrl?: string;
  status: string;
  featured?: boolean;
  rooms?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
