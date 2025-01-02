import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  startDateTime: Date;

  @IsDate()
  @IsNotEmpty()
  endDateTime: Date;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(EventStatus, {
    message: 'Status must be one of: active, scheduled, ended, cancelled'
  })
  @IsOptional()
  status?: EventStatus = EventStatus.SCHEDULED;

  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;
}
