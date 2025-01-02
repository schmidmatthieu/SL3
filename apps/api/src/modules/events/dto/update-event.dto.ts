import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  Matches,
  MinLength,
  IsUrl,
} from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
    message:
      'startDateTime must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  startDateTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
    message:
      'endDateTime must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  endDateTime?: string;

  @IsUrl({}, { message: 'imageUrl must be a valid URL' })
  @IsOptional()
  imageUrl?: string;

  @IsEnum(EventStatus, {
    message: 'Status must be one of: active, scheduled, ended, cancelled',
  })
  @IsOptional()
  status?: EventStatus;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}
