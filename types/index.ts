export type Role = 'admin' | 'eventModerator' | 'roomModerator' | 'speaker' | 'attendee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  startDate: Date;
  endDate: Date;
  rooms: Room[];
  moderators: string[]; // User IDs
}

export interface Room {
  id: string;
  eventId: string;
  name: string;
  description: string;
  streamKey?: string;
  playbackId?: string;
  moderators: string[]; // User IDs
  speakers: string[]; // User IDs
  features: {
    chat: boolean;
    qa: boolean;
    polls: boolean;
    fileSharing: boolean;
  };
}

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'chat' | 'question';
  replyTo?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Poll {
  id: string;
  roomId: string;
  question: string;
  options: string[];
  anonymous: boolean;
  startTime: Date;
  endTime?: Date;
  results?: Record<string, number>;
}