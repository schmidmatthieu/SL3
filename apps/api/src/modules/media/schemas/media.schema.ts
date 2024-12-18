import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  metadata?: {
    title?: string;
    description?: string;
    altText?: string;
    seoTitle?: string;
    seoDescription?: string;
  };

  @Prop({ required: true })
  uploadedBy: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
