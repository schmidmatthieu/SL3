/**
 * Enum representing the possible statuses of a room
 */
export enum RoomStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

/**
 * Enum representing the different types of rooms
 */
export enum RoomType {
  EVENT = 'event',
  MEETING = 'meeting',
  WEBINAR = 'webinar',
}

/**
 * Interface for basic room settings
 */
export interface RoomSettings {
  isPublic: boolean;
  chatEnabled: boolean;
  maxParticipants?: number;
  allowQuestions: boolean;
}
