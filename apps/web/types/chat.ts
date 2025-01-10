export type MessageStatus = 'sending' | 'sent' | 'edited' | 'deleted';

export interface ChatMessage {
  id: string;
  content: string;
  user: ChatUser;
  roomId: string;
  threadId?: string;
  parentId?: string;
  replyCount?: number;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  edited?: boolean;
  emotes?: {
    id: string;
    name: string;
    positions: [number, number][];
  }[];
}

export interface ChatUser {
  id: string;
  username: string;
  color: string;
  avatar?: string;
}

export interface ChatThread {
  id: string;
  parentMessage: ChatMessage;
  messages: ChatMessage[];
  participantIds: string[];
  lastActivityAt: string;
}
