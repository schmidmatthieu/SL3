import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const { roomId, userId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.rpc('assign_room_moderator', {
      p_room_id: roomId,
      p_user_id: userId,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign room moderator' }, { status: 500 });
  }
}
