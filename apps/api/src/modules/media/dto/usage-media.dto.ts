import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MediaUsage, MediaUsageType } from '../types/media.types';

export class UsageMediaDto implements Omit<MediaUsage, 'usedAt'> {
  @IsEnum(['profile', 'speaker', 'event', 'room', 'logo'])
  type: Exclude<MediaUsageType, 'unused'>;

  @IsString()
  entityId: string;

  @IsString()
  @IsOptional()
  entityName?: string;
}
