import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  startDateTime: string;

  @IsDateString()
  @IsNotEmpty()
  endDateTime: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(['active', 'scheduled', 'ended'])
  @IsNotEmpty()
  status: EventStatus;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  rooms: number;
}
