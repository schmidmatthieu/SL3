import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
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
  imageUrl?: string;

  @IsOptional()
  featured?: boolean = false;

  @IsEnum(EventStatus, {
    message: 'Status must be one of: active, scheduled, ended, cancelled',
  })
  @IsOptional()
  status?: EventStatus = EventStatus.SCHEDULED;
}
