import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({
  timestamps: true,
  collection: 'profiles',
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Profile {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  userId: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ type: String, trim: true })
  firstName?: string;

  @Prop({ type: String, trim: true })
  lastName?: string;

  @Prop({ type: String })
  avatarUrl?: string;

  @Prop({ type: String })
  bio?: string;

  @Prop({ type: String, default: 'en' })
  preferredLanguage: string;

  @Prop({ type: String, enum: ['dark', 'light', 'system'], default: 'system' })
  theme: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

// Indexes
ProfileSchema.index({ userId: 1 }, { unique: true });
