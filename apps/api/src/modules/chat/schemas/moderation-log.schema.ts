import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModerationLogDocument = ModerationLog & Document;

export enum ModerationAction {
  BAN = 'ban',
  UNBAN = 'unban',
  MUTE = 'mute',
  UNMUTE = 'unmute',
  DELETE_MESSAGE = 'delete_message',
  WARN = 'warn',
  FLAG = 'flag',
}

export enum ModerationTrigger {
  MANUAL = 'manual',
  AUTO = 'auto',
  REPORT = 'report',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class ModerationLog {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true })
  roomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  moderatorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  targetUserId: Types.ObjectId;

  @Prop({ required: true, enum: ModerationAction })
  action: ModerationAction;

  @Prop({ required: true, enum: ModerationTrigger })
  trigger: ModerationTrigger;

  @Prop()
  reason?: string;

  @Prop({ type: Number })
  duration?: number; // Durée en minutes pour les actions temporaires

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  messageId?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date })
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ModerationLogSchema = SchemaFactory.createForClass(ModerationLog);

// Indexes pour la recherche et le monitoring
ModerationLogSchema.index({ roomId: 1, action: 1 });
ModerationLogSchema.index({ targetUserId: 1, action: 1 });
ModerationLogSchema.index({ createdAt: -1 });
ModerationLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index pour les actions temporaires
