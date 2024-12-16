export interface Profile {
  id: string;
  userId: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}
