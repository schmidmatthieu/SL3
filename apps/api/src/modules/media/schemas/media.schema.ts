import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaUsage, MediaMetadata } from '../types/media.types';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop()
  size: number;

  @Prop({ type: Object })
  metadata?: MediaMetadata;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop([{
    type: {
      type: String,
      enum: ['profile', 'speaker', 'event', 'room', 'logo'],
      required: true
    },
    entityId: { type: String, required: true },
    entityName: String,
    usedAt: { type: Date, default: Date.now }
  }])
  usages: MediaUsage[];

}

export const MediaSchema = SchemaFactory.createForClass(Media);

// Index pour optimiser les requêtes par type d'utilisation
MediaSchema.index({ 'usages.type': 1 });
// Index pour optimiser les requêtes par entityId
MediaSchema.index({ 'usages.entityId': 1 });
// Index composé pour les requêtes combinant type et entityId
MediaSchema.index({ 'usages.type': 1, 'usages.entityId': 1 });
