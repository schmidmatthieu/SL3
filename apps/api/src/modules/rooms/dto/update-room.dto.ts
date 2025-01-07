import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import { IsOptional, ValidateNested, IsEnum, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { RoomSettingsDto } from './create-room.dto';
import { RoomStatus } from '../room.schema';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

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
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

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
