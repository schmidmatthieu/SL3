'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

type Role = 'admin' | 'event_admin' | 'moderator' | 'speaker' | 'participant';
type PermissionType = 'event_moderator' | 'room_moderator' | 'speaker';

export function useRBAC() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [user, profile]);

  const checkPermission = async (type: PermissionType, id: string) => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/roles/check/${type}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.hasPermission;
      }
    } catch (error) {
      console.error('Failed to check permission:', error);
    }

    return false;
  };

  return {
    role: profile?.role as Role | null,
    loading,
    checkPermission,
  };
}
