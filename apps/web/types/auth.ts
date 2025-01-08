import { UserRole } from './roles';
import { Profile } from './profile';

export interface User {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  preferredLanguage?: string;
  theme?: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  profile: Profile;
}
