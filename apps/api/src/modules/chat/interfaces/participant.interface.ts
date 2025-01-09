import { Types } from 'mongoose';
import { UserRole } from '../../users/schemas/user.schema';

/**
 * Interface representing a chat participant with extended properties
 */
export interface ChatParticipant {
  userId: Types.ObjectId;
  role: UserRole;
  joinedAt: Date;
  lastReadAt?: Date;
  isMuted: boolean;
  mutedUntil?: Date;
  isOnline?: boolean;
  lastTypingAt?: Date;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: Date;
  leftAt?: Date;
  preferences?: {
    notifications: boolean;
    soundEnabled: boolean;
    theme?: string;
  };
}
