'use client';

import { Event } from '@/types/event';
import { EventStatusBadge } from '../status/event-status-badge';

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop';

interface EventCardHeaderProps {
  event: Event;
}

export function EventCardHeader({ event }: EventCardHeaderProps) {
    
  return (
    <div className="relative w-full h-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent z-[1]" />
      <img
        src={event.imageUrl || DEFAULT_EVENT_IMAGE}
        alt={event.title}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 overflow-hidden"
      />
      <div className="absolute top-0 right-0 p-4 z-[20]">
        <EventStatusBadge 
          event={event}
          className="shadow-sm"
        />
      </div>
    </div>
  );
}
