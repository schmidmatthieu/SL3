import { Types } from 'mongoose';

export interface SyncResult {
  success: boolean;
  message?: string;
  error?: Error;
}

export interface SpeakerRoomSync {
  speakerId: Types.ObjectId | string;
  roomId: Types.ObjectId | string;
  operation: 'add' | 'remove';
}

export interface RoomSpeakerSync {
  roomId: Types.ObjectId | string;
  speakerId: Types.ObjectId | string;
  operation: 'add' | 'remove';
}

export interface SyncError extends Error {
  entity: 'speaker' | 'room';
  entityId: string;
  operation: string;
}

export class SyncFailedError extends Error implements SyncError {
  constructor(
    public entity: 'speaker' | 'room',
    public entityId: string,
    public operation: string,
    message: string,
  ) {
    super(message);
    this.name = 'SyncFailedError';
  }
}
