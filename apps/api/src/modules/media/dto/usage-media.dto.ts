import { IsString, IsEnum } from 'class-validator';
import { MediaUsage, MediaUsageType } from '../types/media.types';

const mediaUsageTypes = ['profile', 'speaker', 'event', 'room', 'logo', 'unused'] as const;

export class UsageMediaDto implements Omit<MediaUsage, 'usedAt'> {
  @IsEnum(mediaUsageTypes)
  type!: MediaUsageType;

  @IsString()
  entityId!: string;

  @IsString()
  entityName!: string;
}
