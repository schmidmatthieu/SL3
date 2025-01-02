import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const { roomId, userId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Check if caller is event moderator
    const { data: room } = await supabase
      .from('rooms')
      .select('event_id')
      .eq('id', roomId)
      .single();

    if (!room) throw new Error('Room not found');

    const { data: isEventModerator } = await supabase
      .from('event_moderators')
      .select()
      .eq('event_id', room.event_id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!isEventModerator) {
      return NextResponse.json(
        { error: 'Only event moderators can assign speakers' },
        { status: 403 }
      );
    }

    // Update user role and assign to room
    const { error } = await supabase.from('room_speakers').insert({
      room_id: roomId,
      user_id: userId,
      assigned_by: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) throw error;

    // Update user role if needed
    await supabase.from('profiles').update({ role: 'speaker' }).eq('id', userId).eq('role', 'user');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign speaker' }, { status: 500 });
  }
}
