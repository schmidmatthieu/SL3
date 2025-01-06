import { Room } from '@/types/room';

export const rooms: Room[] = [
  {
    id: '1',
    title: 'Main Hall',
    status: 'live',
    thumbnail: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
    participants: 150,
    startTime: '09:00',
    endTime: '18:00',
    languages: ['en', 'fr', 'de'],
  },
  {
    id: '2',
    title: 'Workshop Room A',
    status: 'upcoming',
    thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
    participants: 45,
    startTime: '10:30',
    endTime: '12:30',
    languages: ['en', 'fr'],
  },
  {
    id: '3',
    title: 'Conference Room B',
    status: 'ended',
    thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
    participants: 80,
    startTime: '09:00',
    endTime: '11:00',
    languages: ['en', 'de'],
  },
  {
    id: '4',
    title: 'Exhibition Space',
    status: 'off',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    participants: 0,
    startTime: '14:00',
    endTime: '16:00',
    languages: ['en', 'fr', 'de', 'it'],
  },
];
