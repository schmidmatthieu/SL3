import { Socket } from 'socket.io';
import { Types } from 'mongoose';

export interface AuthenticatedSocket extends Socket {
  user: {
    id: Types.ObjectId;
    username: string;
    avatar?: string;
  };
}

export interface ChatEventPayload {
  roomId: string;
  content?: string;
  messageId?: string;
  isTyping?: boolean;
}

export interface ChatPresencePayload {
  roomId: string;
  userId: Types.ObjectId;
  username: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

export interface ChatTypingPayload {
  roomId: string;
  userId: Types.ObjectId;
  username: string;
  isTyping: boolean;
}
