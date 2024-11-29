export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EVENT_MODERATOR = 'EVENT_MODERATOR',
  ROOM_MODERATOR = 'ROOM_MODERATOR',
  SPEAKER = 'SPEAKER',
  USER = 'USER',
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}
