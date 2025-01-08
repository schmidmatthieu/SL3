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
  // Les permissions sont dérivées du rôle de l'utilisateur
  // et sont calculées dynamiquement en fonction du UserRole
  preferences?: {
    notifications: boolean;
    soundEnabled: boolean;
    theme?: string;
  };
}
