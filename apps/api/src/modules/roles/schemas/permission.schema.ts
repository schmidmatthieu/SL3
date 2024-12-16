import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PermissionDocument = Permission & Document;

export enum PermissionType {
  EVENT_MODERATOR = 'event_moderator',
  ROOM_MODERATOR = 'room_moderator',
  SPEAKER = 'speaker'
}

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: String, enum: PermissionType, required: true })
  type: PermissionType;

  @Prop({ type: String, required: true })
  resourceId: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
