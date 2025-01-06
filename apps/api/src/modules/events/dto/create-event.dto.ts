import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
    message: 'startDateTime must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  startDateTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
    message: 'endDateTime must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  endDateTime: string;

  @IsString()
  @IsOptional()
  @Matches(/^https?:\/\/.*$/, { message: 'imageUrl must start with http:// or https://' })
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;

  @IsEnum(EventStatus, {
    message: 'Status must be one of: active, scheduled, ended, cancelled',
  })
  @IsNotEmpty()
  status: EventStatus = EventStatus.SCHEDULED;
}
