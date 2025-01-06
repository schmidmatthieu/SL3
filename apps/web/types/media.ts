export type MediaUsage = {
  type: 'profile' | 'speaker' | 'event' | 'room' | 'logo' | 'other';
  entityId: string;
  entityName?: string;
  path: string;
};

export type MediaMetadata = {
  title?: string;
  description?: string;
  altText?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type MediaItem = {
  _id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  metadata?: MediaMetadata;
  usages?: MediaUsage[];
  createdAt: string;
  updatedAt: string;
};
