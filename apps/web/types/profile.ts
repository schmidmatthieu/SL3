import { UserRole } from './roles';

export interface Profile {
  id: string;
  userId: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  bio?: string;
  preferredLanguage?: string;
  theme?: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}
