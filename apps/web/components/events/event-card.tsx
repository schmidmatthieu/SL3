'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { ArrowRight, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EventCardProps } from './event-card/types';
import { EventCardHeader } from './event-card/event-card-header';
import { EventCardContent } from './event-card/event-card-content';
import { useEventCardContent } from './event-card/use-event-card-content';

export function EventCard({ event }: EventCardProps) {
  const { user, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  const isEventAdmin = user?.id === event.createdBy;
  const canManageEvent = isAdmin || isEventAdmin;
  const { t } = useTranslation();
  const { content } = useEventCardContent();

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'bg-background transition-all duration-300',
        'border border-primary-100/30 dark:border-primary-800/30',
        'hover:border-primary-200/50 dark:hover:border-primary-700/50',
        'hover:shadow-lg dark:hover:shadow-primary-950/10',
        event.status === 'cancelled' && 'opacity-50',
        event.featured && [
          'border-2 border-primary hover:border-primary/80',
          'shadow-md hover:shadow-xl',
          'dark:shadow-primary-950/20',
          'scale-[1.02]',
          'bg-gradient-to-br from-primary-50/50 to-background/50',
          'dark:from-primary-950/50 dark:to-background/50',          
        ]
      )}
    >
      {event.featured && (
        <div className="absolute top-4 left-4 z-[15]">
          <Badge variant="default" className="bg-primary text-white font-medium shadow-sm">
            {t('events.card.featured')}
          </Badge>
        </div>
      )}
      
      {event.status !== 'cancelled' && (
        <Link
          href={`/events/${event.id || event._id}`}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${event.title}`}
        />
      )}

      <CardContent className="p-0">
        <EventCardHeader event={event} />

        <div className="p-6">
          <div className="space-y-2 mb-6">
            <h3 className="text-xl font-semibold tracking-tight">{event.title}</h3>
            <p className="text-primary-600/70 dark:text-primary-300/70 line-clamp-2">
              {event.description}
            </p>
          </div>

          <EventCardContent event={event} content={content} />

          {canManageEvent && (
            <div className="absolute bottom-6 right-6 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-20">
              <Link href={`/events/${event.id || event._id}/manage`}>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
