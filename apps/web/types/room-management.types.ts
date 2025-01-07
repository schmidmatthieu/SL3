import { Room, RoomStatus } from './room';
import { Event } from './event';

export interface CreateRoomFormData {
  name: string;
  capacity: string;
  description: string;
  thumbnail: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  chatEnabled: boolean;
  recordingEnabled: boolean;
  originalLanguage: string;
  availableLanguages: string[];
}

export interface RoomControlsProps {
  room: Room;
  onStreamControl: (roomId: string | undefined, action: 'start' | 'pause' | 'stop' | 'end') => Promise<void>;
  onStatusChange: (roomId: string | undefined, status: RoomStatus) => Promise<void>;
  onDelete: (roomId: string | undefined) => Promise<void>;
}

export interface RoomListProps {
  rooms: Room[];
  onStreamControl: (roomId: string | undefined, action: 'start' | 'pause' | 'stop' | 'end') => Promise<void>;
  onStatusChange: (roomId: string | undefined, status: RoomStatus) => Promise<void>;
  onDelete: (roomId: string | undefined) => Promise<void>;
}

export interface CreateRoomFormProps {
  onSubmit: (data: CreateRoomFormData) => Promise<void>;
  isLoading?: boolean;
}

export const AVAILABLE_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
] as const;
