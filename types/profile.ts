export interface Profile {
  id: string;
  userId: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  preferredLanguage?: string;
  theme?: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}
