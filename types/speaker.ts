export interface Speaker {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  rooms: string[];
  eventId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateSpeakerDto = Omit<Speaker, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSpeakerDto = Partial<CreateSpeakerDto>;
