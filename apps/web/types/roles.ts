/**
 * Rôles d'utilisateur disponibles dans l'application
 * Doit être synchronisé avec l'enum UserRole du backend
 */
export enum UserRole {
  ADMIN = 'admin',
  EVENT_ADMIN = 'event_admin',
  ROOM_MODERATOR = 'room_moderator',
  ROOM_SPEAKER = 'room_speaker',
  PARTICIPANT = 'participant',
}

/**
 * Types de permissions spécifiques pour les ressources
 * Doit être synchronisé avec l'enum PermissionType du backend
 */
export enum PermissionType {
  EVENT_ADMIN = 'event_admin',
  EVENT_MODERATOR = 'event_moderator',
  ROOM_MODERATOR = 'room_moderator',
  ROOM_SPEAKER = 'room_speaker',
  CHAT_MODERATOR = 'chat_moderator',
  PARTICIPANT = 'participant',
}

/**
 * Interface pour les permissions d'utilisateur
 */
export interface Permission {
  userId: string;
  type: PermissionType;
  resourceId: string;
  active: boolean;
  grantedBy?: string;
  grantedAt?: string;
  revokedBy?: string;
  revokedAt?: string;
  expiresAt?: string;
}

/**
 * Vérifie si un rôle a les permissions d'administrateur
 */
export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.EVENT_ADMIN;
}

/**
 * Vérifie si un rôle a les permissions de modération
 */
export function isModeratorRole(role: UserRole): boolean {
  return (
    isAdminRole(role) ||
    role === UserRole.ROOM_MODERATOR
  );
}

/**
 * Vérifie si un rôle a les permissions de speaker
 */
export function isSpeakerRole(role: UserRole): boolean {
  return (
    isModeratorRole(role) ||
    role === UserRole.ROOM_SPEAKER
  );
}

/**
 * Convertit un UserRole en PermissionType correspondant
 */
export function mapUserRoleToPermissionType(role: UserRole): PermissionType {
  switch (role) {
    case UserRole.ADMIN:
      return PermissionType.EVENT_ADMIN;
    case UserRole.EVENT_ADMIN:
      return PermissionType.EVENT_ADMIN;
    case UserRole.ROOM_MODERATOR:
      return PermissionType.ROOM_MODERATOR;
    case UserRole.ROOM_SPEAKER:
      return PermissionType.ROOM_SPEAKER;
    default:
      return PermissionType.PARTICIPANT;
  }
}
