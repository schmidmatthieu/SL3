export type RoomStatus = 'upcoming' | 'live' | 'paused' | 'ended' | 'cancelled';

export const ROOM_STATUS_TRANSLATIONS = {
  upcoming: {
    en: 'Upcoming',
    fr: 'À venir',
    de: 'Kommend',
    it: 'In arrivo',
  },
  live: {
    en: 'Live',
    fr: 'En direct',
    de: 'Live',
    it: 'In diretta',
  },
  paused: {
    en: 'Paused',
    fr: 'En pause',
    de: 'Pausiert',
    it: 'In pausa',
  },
  ended: {
    en: 'Ended',
    fr: 'Terminé',
    de: 'Beendet',
    it: 'Terminato',
  },
  cancelled: {
    en: 'Cancelled',
    fr: 'Annulé',
    de: 'Abgesagt',
    it: 'Annullato',
  },
} as const;

export interface RoomSettings {
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  maxParticipants?: number;
  allowQuestions: boolean;
  originalLanguage: string; // Langue originale (VO)
  availableLanguages: string[]; // Langues disponibles pour le multicanal
}

export interface Room {
  id?: string;
  _id?: string;
  name: string;
  eventId: string;
  description?: string;
  thumbnail?: string;
  status: RoomStatus;
  startTime: string; // Format ISO: "2024-12-31T09:00:00Z"
  endTime: string; // Format ISO: "2024-12-31T10:00:00Z"
  streamKey?: string;
  streamUrl?: string;
  settings: RoomSettings;
  participants?: string[];
  speakers?: string[];
  moderators?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
