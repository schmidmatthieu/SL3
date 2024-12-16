import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const {
      data: { role },
    } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session?.user?.id)
      .single();

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Protect event moderator routes
  if (req.nextUrl.pathname.startsWith('/events/manage')) {
    const eventId = req.nextUrl.pathname.split('/')[3];
    const {
      data: isEventModerator,
    } = await supabase
      .from('event_moderators')
      .select()
      .eq('event_id', eventId)
      .eq('user_id', session?.user?.id)
      .single();

    if (!isEventModerator) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Protect room moderator routes
  if (req.nextUrl.pathname.includes('/rooms') && req.nextUrl.pathname.endsWith('/mod')) {
    const roomId = req.nextUrl.pathname.split('/')[5];
    const {
      data: isRoomModerator,
    } = await supabase
      .from('room_moderators')
      .select()
      .eq('room_id', roomId)
      .eq('user_id', session?.user?.id)
      .single();

    if (!isRoomModerator) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Check access for private/paid events
  if (req.nextUrl.pathname.startsWith('/events/')) {
    const eventId = req.nextUrl.pathname.split('/')[2];
    const {
      data: event,
    } = await supabase
      .from('events')
      .select('access_type')
      .eq('id', eventId)
      .single();

    if (event?.access_type !== 'public') {
      const {
        data: hasAccess,
      } = await supabase
        .from('event_access')
        .select()
        .eq('event_id', eventId)
        .eq('user_id', session?.user?.id)
        .single();

      if (!hasAccess) {
        return NextResponse.redirect(new URL(`/events/${eventId}/access`, req.url));
      }
    }
  }

  return res;
}