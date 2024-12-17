import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';

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

  @IsEnum(['live', 'upcoming', 'ended'])
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  rooms: number;
}
