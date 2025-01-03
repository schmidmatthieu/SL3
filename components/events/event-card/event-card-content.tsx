'use client';

import { format } from 'date-fns';
import { Calendar, Clock, Users } from 'lucide-react';
import { Event } from '@/types/event';
import { EventContentType } from './types';

interface EventCardContentProps {
  event: Event;
  content: EventContentType;
}

export function EventCardContent({ event, content }: EventCardContentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
            {content.card.startDate}
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-primary-600/70 dark:text-primary-300/70 truncate">
              {format(new Date(event.startDateTime), 'PPP')}
            </p>
            <span className="text-sm text-primary-600/50 dark:text-primary-300/50">•</span>
            <p className="text-sm font-medium text-primary-600/90 dark:text-primary-300/90">
              {format(new Date(event.startDateTime), 'HH:mm')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
            {content.card.endDate}
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-primary-600/70 dark:text-primary-300/70 truncate">
              {format(new Date(event.endDateTime), 'PPP')}
            </p>
            <span className="text-sm text-primary-600/50 dark:text-primary-300/50">•</span>
            <p className="text-sm font-medium text-primary-600/90 dark:text-primary-300/90">
              {format(new Date(event.endDateTime), 'HH:mm')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary-900 dark:text-primary-100">Rooms</p>
          <p className="text-sm text-primary-600/70 dark:text-primary-300/70">
            {event.rooms?.length || 0} rooms
          </p>
        </div>
      </div>
    </div>
  );
}
