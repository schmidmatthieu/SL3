import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ProfileDocument = Profile & Document;

export enum UserRole {
  ADMIN = 'admin',
  EVENT_ADMIN = 'event_admin',
  MODERATOR = 'moderator',
  SPEAKER = 'speaker',
  PARTICIPANT = 'participant',
}

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: String, enum: UserRole, default: UserRole.PARTICIPANT })
  role: UserRole;

  @Prop({ type: Object })
  settings: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
