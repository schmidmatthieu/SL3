import { Room, RoomStatus } from '@/types/room';

export const rooms: Room[] = [
  {
    _id: 'openai',
    name: 'OpenAI & ChatGPT',
    slug: 'openai',
    eventSlug: 'ai-conference',
    description: 'Discussion sur OpenAI et ChatGPT',
    status: 'upcoming' as RoomStatus,
    settings: {
      isPublic: true,
      chatEnabled: true,
      recordingEnabled: true,
      maxParticipants: 100,
      allowQuestions: true,
      originalLanguage: 'fr',
      availableLanguages: ['fr', 'en']
    },
    speakers: [],
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'futur-of-ai',
    name: 'Le Futur de l\'IA',
    slug: 'futur-of-ai',
    eventSlug: 'ai-conference',
    description: 'Discussion sur l\'avenir de l\'intelligence artificielle',
    status: 'upcoming' as RoomStatus,
    settings: {
      isPublic: true,
      chatEnabled: true,
      recordingEnabled: true,
      maxParticipants: 100,
      allowQuestions: true,
      originalLanguage: 'fr',
      availableLanguages: ['fr', 'en']
    },
    speakers: [],
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'github-copilot',
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    eventSlug: 'ai-conference',
    description: 'Discussion sur GitHub Copilot et les outils de génération de code',
    status: 'upcoming' as RoomStatus,
    settings: {
      isPublic: true,
      chatEnabled: true,
      recordingEnabled: true,
      maxParticipants: 100,
      allowQuestions: true,
      originalLanguage: 'fr',
      availableLanguages: ['fr', 'en']
    },
    speakers: [],
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
