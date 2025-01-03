import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Speaker extends Document {
  @Prop({ required: false })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false })
  role: string;

  @Prop({ required: false })
  company: string;

  @Prop({ required: false })
  bio: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({ type: [String], default: [] })
  rooms: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Event' })
  eventId: string;

  @Prop({
    type: {
      linkedin: { type: String, required: false },
      twitter: { type: String, required: false },
    },
    required: false,
    _id: false,
  })
  socialLinks: {
    linkedin?: string;
    twitter?: string;
  };
}

export const SpeakerSchema = SchemaFactory.createForClass(Speaker);
