import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, Min, ValidateIf } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDateTime?: string;

  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => {
    if (o.startDateTime && o.endDateTime) {
      return new Date(o.endDateTime) <= new Date(o.startDateTime);
    }
    return false;
  })
  endDateTime?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(['active', 'scheduled', 'ended', 'cancelled'])
  @IsOptional()
  status?: EventStatus;

  @IsNumber()
  @Min(1)
  @IsOptional()
  rooms?: number;
}
