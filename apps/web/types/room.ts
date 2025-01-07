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
  originalLanguage: string;
  availableLanguages: string[];
}

export interface Room {
  _id: string;
  name: string;
  slug: string;
  eventSlug: string;
  description?: string;
  status: RoomStatus;
  settings?: RoomSettings;
  startTime?: string;
  endTime?: string;
  thumbnail?: string;
  speakers?: string[];
  participants?: string[];
  streamUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomDTO {
  name: string;
  eventSlug: string;
  description?: string;
  status: RoomStatus;
  settings?: RoomSettings;
  startTime?: string;
  endTime?: string;
  thumbnail?: string;
  speakers?: string[];
}

export interface UpdateRoomDTO extends Partial<CreateRoomDTO> {}
