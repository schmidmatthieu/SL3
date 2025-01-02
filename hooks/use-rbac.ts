'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/types/supabase';
import { useAuth } from '@/hooks/use-auth';

type Role = Database['public']['Enums']['user_role'];

export function useRBAC() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setRole(data.role);
      }
      setLoading(false);
    }

    fetchRole();
  }, [user]);

  const checkPermission = async (
    type: 'event_moderator' | 'room_moderator' | 'speaker',
    id: string
  ) => {
    if (!user) return false;

    const table =
      type === 'event_moderator'
        ? 'event_moderators'
        : type === 'room_moderator'
          ? 'room_moderators'
          : 'room_speakers';

    const column = type === 'event_moderator' ? 'event_id' : 'room_id';

    const { data } = await supabase
      .from(table)
      .select()
      .eq(column, id)
      .eq('user_id', user.id)
      .single();

    return !!data;
  };

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isEventModerator: role === 'event_moderator',
    isRoomModerator: role === 'room_moderator',
    isSpeaker: role === 'speaker',
    checkPermission,
  };
}
