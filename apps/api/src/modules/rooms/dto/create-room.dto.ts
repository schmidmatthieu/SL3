import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus } from '../room.schema';

export class RoomSettingsDto {
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsBoolean()
  @IsOptional()
  chatEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  recordingEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  maxParticipants?: number;

  @IsBoolean()
  @IsOptional()
  allowQuestions?: boolean;

  @IsString()
  @IsOptional()
  originalLanguage?: string;

  @IsString({ each: true })
  @IsOptional()
  availableLanguages?: string[];
}

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  eventSlug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional()
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  streamKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  streamUrl?: string;

  @ValidateNested()
  @Type(() => RoomSettingsDto)
  @IsOptional()
  settings?: RoomSettingsDto;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  speakers?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  moderators?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  participants?: string[];
}
