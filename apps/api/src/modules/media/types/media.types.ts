import { Document, Types } from 'mongoose';

export type MediaUsageType =
  | 'profile'
  | 'speaker'
  | 'event'
  | 'room'
  | 'logo'
  | 'unused';

export interface MediaUsage {
  type: MediaUsageType;
  entityId: string;
  entityName: string;
  usedAt: Date;
}

export interface MediaMetadata {
  title?: string;
  description?: string;
  altText?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Media {
  _id: Types.ObjectId;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  usages: MediaUsage[];
  createdAt: Date;
  updatedAt: Date;
}

export type MediaDocument = Document & Omit<Media, '_id'> & {
  _id: Types.ObjectId;
};
