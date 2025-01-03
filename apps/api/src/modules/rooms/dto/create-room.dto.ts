import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @IsString()
  name: string;

  @IsString()
  eventId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  @IsOptional()
  streamKey?: string;

  @IsString()
  @IsOptional()
  streamUrl?: string;

  @ValidateNested()
  @Type(() => RoomSettingsDto)
  @IsOptional()
  settings?: RoomSettingsDto;

  @IsString({ each: true })
  @IsOptional()
  speakers?: string[];

  @IsString({ each: true })
  @IsOptional()
  moderators?: string[];

  @IsString({ each: true })
  @IsOptional()
  participants?: string[];
}
