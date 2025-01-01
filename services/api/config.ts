export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  endpoints: {
    auth: '/api/auth',
    events: '/api/events',
    profiles: '/api/profiles',
    speakers: '/api/speakers',
    media: '/api/media',
    rooms: '/api/rooms',
    stream: '/api/stream'
  }
};
