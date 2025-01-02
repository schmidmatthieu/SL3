import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaMetadata } from '../types/media.types';

export class CreateMediaDto {
  @IsString()
  filename: string;

  @IsString()
  url: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  @IsOptional()
  size?: number;

  @ValidateNested()
  @Type(() => MediaMetadata)
  @IsOptional()
  metadata?: MediaMetadata;

  @IsString()
  uploadedBy: string;
}
