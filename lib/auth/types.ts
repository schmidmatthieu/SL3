export type Role = 'user' | 'roomModerator' | 'eventModerator' | 'speaker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: Date;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const ROLE_PERMISSIONS = {
  user: ['view:events', 'join:rooms', 'chat:send', 'questions:ask'],
  roomModerator: [
    'view:events',
    'join:rooms',
    'chat:send',
    'chat:moderate',
    'questions:ask',
    'questions:answer',
    'questions:moderate',
    'polls:create',
    'polls:manage',
    'files:upload',
    'files:manage',
  ],
  eventModerator: [
    'view:events',
    'manage:events',
    'join:rooms',
    'manage:rooms',
    'chat:send',
    'chat:moderate',
    'questions:ask',
    'questions:answer',
    'questions:moderate',
    'polls:create',
    'polls:manage',
    'files:upload',
    'files:manage',
    'users:manage',
  ],
  speaker: [
    'view:events',
    'join:rooms',
    'chat:send',
    'questions:ask',
    'questions:answer',
    'files:upload',
    'stream:manage',
  ],
} as const;