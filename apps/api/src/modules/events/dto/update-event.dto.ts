import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(['live', 'upcoming', 'ended'])
  @IsOptional()
  status?: EventStatus;
}
