import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, IndexDefinition } from 'mongoose';
import { Room, RoomSchema } from './room.schema';
import { ChatParticipant } from '../interfaces/participant.interface';
import { ChatRoomSettings } from '../interfaces/chat-room.interface';

export type ChatRoomDocument = ChatRoom & Document;

const ParticipantSchema = {
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  joinedAt: { type: Date, required: true },
  lastReadAt: { type: Date },
  isMuted: { type: Boolean, default: false },
  mutedUntil: { type: Date },
  isOnline: { type: Boolean, default: false },
  lastTypingAt: { type: Date },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedAt: { type: Date },
  leftAt: { type: Date },
  preferences: {
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    theme: { type: String },
  },
};

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
export class ChatRoom extends Room {
  @Prop({
    type: [ParticipantSchema],
    default: [],
  })
  participants: ChatParticipant[];

  @Prop({
    type: Object,
    default: {
      chatEnabled: true,
      isArchived: false,
      allowEmojis: true,
      allowGifs: true,
      allowFiles: true,
      maxMessageLength: 1000,
      maxFileSize: 10,
      rateLimitMessages: 30,
      autoModeration: {
        enabled: true,
        profanityFilter: true,
        spamFilter: true,
        linkFilter: false,
      },
    },
  })
  chatSettings: ChatRoomSettings;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessageId?: Types.ObjectId;

  @Prop({ type: Date })
  lastActivityAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Methods
  canSendMessage(userId: Types.ObjectId | string): boolean {
    const participant = this.participants.find(p => 
      p.userId.equals(new Types.ObjectId(userId))
    );
    if (!participant) return false;
    if (participant.isMuted && participant.mutedUntil && participant.mutedUntil > new Date()) return false;
    if (participant.isBanned) return false;
    if (participant.leftAt) return false;
    return this.chatSettings.chatEnabled && !this.chatSettings.isArchived;
  }
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

// Inherit all indexes from RoomSchema
const parentIndexes = RoomSchema.indexes();
parentIndexes.forEach((index) => {
  ChatRoomSchema.index(index[0] as IndexDefinition, index[1]);
});

// Additional indexes for chat functionality
ChatRoomSchema.index({ lastActivityAt: -1 });
ChatRoomSchema.index({ lastMessageId: 1 });

// Virtuals
ChatRoomSchema.virtual('lastMessage', {
  ref: 'Message',
  localField: 'lastMessageId',
  foreignField: '_id',
  justOne: true,
});