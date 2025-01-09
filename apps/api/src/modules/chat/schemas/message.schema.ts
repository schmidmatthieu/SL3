import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Room } from './room.schema';

export type MessageDocument = Message & Document;

interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
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
export class Message {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Room;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [Object], default: [] })
  attachments: MessageAttachment[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: false })
  edited: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  editedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyToMessage?: Message;

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes
MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1 });
MessageSchema.index({ replyTo: 1 });

// Virtuals
MessageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

MessageSchema.virtual('room', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true,
});

MessageSchema.virtual('repliedMessage', {
  ref: 'Message',
  localField: 'replyTo',
  foreignField: '_id',
  justOne: true,
});
