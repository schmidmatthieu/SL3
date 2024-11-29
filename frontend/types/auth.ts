export interface User {
  id: string;
  email: string;
  username?: string;
  role: 'user' | 'admin' | 'moderator';
  bio?: string;
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username?: string;
}
