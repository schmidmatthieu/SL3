export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  endpoints: {
    events: '/api/events',
    rooms: '/api/rooms',
    speakers: '/api/speakers',
    stream: '/api/stream',
    auth: '/api/auth',
  },
  headers: {
    'Content-Type': 'application/json',
  },
} as const;
