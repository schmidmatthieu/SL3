export type MessageStatus = 'sending' | 'delivered';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  color: string;
  content: string;
  timestamp: number;
  status: MessageStatus;
  avatar?: string;
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
