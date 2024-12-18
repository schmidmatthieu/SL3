export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  endpoints: {
    auth: '/auth',
    events: '/events',  // Removed /api prefix since it's added in the service
    profiles: '/profiles',  // Removed /api prefix for consistency
    speakers: '/speakers',
    media: '/media',
  }
};
