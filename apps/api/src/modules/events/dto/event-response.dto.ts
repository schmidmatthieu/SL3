import { Room } from '../../rooms/room.schema';
import { EventStatus } from '../schemas/event.schema';

export class EventResponseDto {
  id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  imageUrl?: string;
  status: EventStatus;
  featured?: boolean;
  rooms: Room[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
