import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../users/schemas/user.schema';
import { RoomStatus, RoomType, RoomSettings } from '../../../common/types/room.types';
import { Event } from '../../events/schemas/event.schema';

export type RoomDocument = Room & Document;

@Schema({
  timestamps: true,
  collection: 'rooms',
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
export class Room {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: String, enum: RoomType, default: RoomType.EVENT })
  type: RoomType;

  @Prop({ type: String, enum: RoomStatus, default: RoomStatus.UPCOMING })
  status: RoomStatus;

  @Prop({
    type: Object,
    default: {
      isPublic: true,
      chatEnabled: true,
      allowQuestions: true,
    },
  })
  settings: RoomSettings;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Event;

  @Prop({ type: Date })
  scheduledStartTime?: Date;

  @Prop({ type: Date })
  scheduledEndTime?: Date;

  @Prop({ type: Date })
  actualStartTime?: Date;

  @Prop({ type: Date })
  actualEndTime?: Date;

  @Prop({ type: String })
  streamKey?: string;

  @Prop({ type: String })
  streamUrl?: string;

  @Prop([{
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: UserRole, required: true },
    joinedAt: { type: Date, default: Date.now },
    lastReadAt: { type: Date },
    isMuted: { type: Boolean, default: false },
    mutedUntil: { type: Date },
  }])
  participants: Array<{
    userId: Types.ObjectId;
    role: UserRole;
    joinedAt: Date;
    lastReadAt?: Date;
    isMuted: boolean;
    mutedUntil?: Date;
  }>;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Indexes
RoomSchema.index({ slug: 1 }, { unique: true });
RoomSchema.index({ status: 1 });
RoomSchema.index({ type: 1 });
RoomSchema.index({ eventId: 1 });
RoomSchema.index({ 'participants.userId': 1 });
RoomSchema.index({ scheduledStartTime: 1 });
RoomSchema.index({ actualStartTime: 1 });

// Virtuals
RoomSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventId',
  foreignField: '_id',
  justOne: true,
});

// Methods
RoomSchema.methods.isParticipant = function(userId: Types.ObjectId | string) {
  return this.participants.some(p => p.userId.equals(userId));
};

RoomSchema.methods.getParticipant = function(userId: Types.ObjectId | string) {
  return this.participants.find(p => p.userId.equals(userId)) || null;
};
