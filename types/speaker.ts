export interface Speaker {
  id: string;
  firstName?: string;
  lastName: string;
  role?: string;
  company?: string;
  bio?: string;
  imageUrl?: string;
  rooms?: string[];
  eventId: string;
  createdAt: string;
  updatedAt: string;
  sessions?: Array<{
    id: string;
    title: string;
    time: string;
  }>;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

export type CreateSpeakerDto = Omit<Speaker, 'id' | 'createdAt' | 'updatedAt' | 'sessions'>;

export type UpdateSpeakerDto = Partial<CreateSpeakerDto>;
