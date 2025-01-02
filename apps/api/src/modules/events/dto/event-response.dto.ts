import { EventStatus } from '../schemas/event.schema';

export class EventResponseDto {
  id: string;
  title: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  status?: EventStatus;
  featured?: boolean;
  imageUrl?: string;
  rooms: string[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
