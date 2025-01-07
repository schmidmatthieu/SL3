import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString({ message: 'Start date must be a string' })
  @IsNotEmpty({ message: 'Start date is required' })
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
    message: 'Start date must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  startDateTime: string;

  @IsString({ message: 'End date must be a string' })
  @IsNotEmpty({ message: 'End date is required' })
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
    message: 'End date must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  endDateTime: string;

  @IsString({ message: 'Image URL must be a string' })
  @IsOptional()
  @Matches(/^https?:\/\/.*$/, { message: 'Image URL must start with http:// or https://' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @MinLength(3, { message: 'Slug must be at least 3 characters long' })
  @MaxLength(100, { message: 'Slug must not exceed 100 characters' })
  slug?: string;

  @IsBoolean({ message: 'Featured must be a boolean' })
  @IsOptional()
  featured?: boolean = false;

  @IsEnum(EventStatus, {
    message: 'Status must be one of: active, scheduled, ended, cancelled',
  })
  @IsNotEmpty()
  status: EventStatus = EventStatus.SCHEDULED;
}
