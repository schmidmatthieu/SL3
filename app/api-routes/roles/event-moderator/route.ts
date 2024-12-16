import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { eventId, userId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { data: caller } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (caller?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can assign event moderators' },
        { status: 403 }
      );
    }

    const { error } = await supabase.rpc('assign_event_moderator', {
      p_event_id: eventId,
      p_user_id: userId,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to assign event moderator' },
      { status: 500 }
    );
  }
}