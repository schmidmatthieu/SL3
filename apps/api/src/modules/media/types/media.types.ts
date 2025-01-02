export type MediaUsageType =
  | 'profile'
  | 'speaker'
  | 'event'
  | 'room'
  | 'logo'
  | 'unused';

export interface MediaUsage {
  type: Exclude<MediaUsageType, 'unused'>;
  entityId: string;
  entityName?: string;
  usedAt: Date;
}

export interface MediaMetadata {
  title?: string;
  description?: string;
  altText?: string;
  seoTitle?: string;
  seoDescription?: string;
}
