import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type RoomDocument = Room & Document;

export enum RoomStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class RoomSettings {
  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: true })
  chatEnabled: boolean;

  @Prop({ default: true })
  recordingEnabled: boolean;

  @Prop()
  maxParticipants?: number;

  @Prop({ default: true })
  allowQuestions: boolean;

  @Prop({ default: 'fr' })
  originalLanguage: string;

  @Prop({ type: [String], default: [] })
  availableLanguages: string[];
}

const RoomSettingsSchema = SchemaFactory.createForClass(RoomSettings);

@Schema()
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  eventId: Types.ObjectId | string;

  @Prop({ 
    required: true, 
    type: String,
    enum: RoomStatus,
    default: RoomStatus.UPCOMING
  })
  status: RoomStatus;

  @Prop()
  description?: string;

  @Prop()
  thumbnail?: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop()
  streamKey?: string;

  @Prop()
  streamUrl?: string;

  @Prop({ type: RoomSettings })
  settings: RoomSettings;

  @Prop({ type: [{ type: Types.ObjectId }] })
  participants: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  speakers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  moderators: Types.ObjectId[];

  @Prop({ required: true, type: Types.ObjectId })
  createdBy: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
