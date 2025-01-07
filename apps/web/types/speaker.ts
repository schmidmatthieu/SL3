export interface Speaker {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName: string;
  role?: string;
  company?: string;
  bio?: string;
  imageUrl?: string;
  rooms?: string[];
  eventId: string;
  createdAt?: string;
  updatedAt?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface CreateSpeakerDto {
  firstName?: string;
  lastName: string;
  role?: string;
  company?: string;
  bio?: string;
  imageUrl?: string;
  eventId: string;
  rooms?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

export type UpdateSpeakerDto = Partial<CreateSpeakerDto>;
