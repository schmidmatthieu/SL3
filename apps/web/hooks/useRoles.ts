import { useAuthStore } from '@/lib/store/auth-store';
import { UserRole, isAdminRole, isModeratorRole, isSpeakerRole } from '@/types/roles';

export function useRoles() {
  const { user, profile } = useAuthStore();
  const role = user?.role || UserRole.PARTICIPANT;

  return {
    role,
    isAdmin: isAdminRole(role),
    isModerator: isModeratorRole(role),
    isSpeaker: isSpeakerRole(role),
    isParticipant: role === UserRole.PARTICIPANT,
    
    // Fonctions de vérification spécifiques
    canModerateEvent: isAdminRole(role),
    canModerateRoom: isModeratorRole(role),
    canSpeak: isSpeakerRole(role),
    canParticipate: true, // Tout le monde peut participer
  };
}

export function usePermissions(resourceId?: string) {
  const { role } = useRoles();

  const checkPermission = async (type: string): Promise<boolean> => {
    if (!resourceId) return false;
    
    try {
      const response = await fetch(`/api/roles/check/${type}/${resourceId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  return {
    checkPermission,
    // Permissions par défaut basées sur le rôle
    canModerate: isModeratorRole(role),
    canSpeak: isSpeakerRole(role),
    canParticipate: true,
  };
}
