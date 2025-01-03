import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import { IsOptional, ValidateNested, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RoomSettingsDto } from './create-room.dto';
import { RoomStatus } from '../room.schema';

export class UpdateRoomDto {
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

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
