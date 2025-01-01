'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useEvents } from '@/hooks/useEvents';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/store/event.store';
import { Settings, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop';

interface EventCardProps {
  event: Event;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'live':
      return 'bg-third text-black';
    case 'scheduled':
    case 'upcoming':
      return 'bg-blue-500 text-white dark:bg-blue-600';
    case 'ended':
      return 'bg-secondary text-black';
    case 'cancelled':
      return 'bg-destructive text-destructive-foreground dark:bg-destructive/90';
    default:
      return 'bg-secondary text-black';
  }
};

export function EventCard({ event }: EventCardProps) {
  const { user, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  const isEventAdmin = user?.id === event.createdBy;
  const canManageEvent = isAdmin || isEventAdmin;
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const staticContent = {
    status: {
      live: "Live",
      scheduled: "Scheduled",
      ended: "Ended",
      draft: "Draft",
      cancelled: "Cancelled",
      postponed: "Postponed",
      active: "Live"
    },
    card: {
      startDate: "Start Date",
      endDate: "End Date",
      manageEvent: "Manage Event"
    }
  };

  const translatedContent = {
    status: {
      live: t('events.status.live'),
      scheduled: t('events.status.scheduled'),
      ended: t('events.status.ended'),
      draft: t('events.status.draft'),
      cancelled: t('events.status.cancelled'),
      postponed: t('events.status.postponed'),
      active: t('events.status.active')
    },
    card: {
      startDate: t('events.card.startDate'),
      endDate: t('events.card.endDate'),
      manageEvent: t('events.card.manage')
    }
  };

  const content = isClient ? translatedContent : staticContent;

  const getDisplayStatus = (status: string) => {
    const statusKey = status.toLowerCase();
    return content.status[statusKey as keyof typeof content.status] || 
           status.charAt(0).toUpperCase() + status.slice(1);
  };

  // On utilise directement l'événement passé en props
  const displayEvent = event;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all card-hover-effect",
        "bg-background/40 backdrop-blur-[12px]",
        "border-primary-100/30 dark:border-primary-800/30",
        "hover:bg-primary-50/30 dark:hover:bg-primary-950/30",
        displayEvent.status === 'cancelled' && "opacity-50"
      )}
    >
      {displayEvent.status !== 'cancelled' && (
        <Link 
          href={`/events/${displayEvent.id || displayEvent._id}`}
          className="absolute inset-0 z-10"
          aria-label={`View details for ${displayEvent.title}`}
        />
      )}
      <CardContent className="p-0">
        <div className="relative w-full h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          <img
            src={displayEvent.imageUrl || DEFAULT_EVENT_IMAGE}
            alt={displayEvent.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge
            className={cn(
              "absolute top-4 right-4",
              "transition-all duration-300",
              "group-hover:scale-105 font-medium",
              getStatusColor(displayEvent.status)
            )}
          >
            {getDisplayStatus(displayEvent.status)}
          </Badge>
        </div>
            
        <div className="p-6">
          <div className="space-y-2 mb-6">
            <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300">
              {displayEvent.title}
            </h3>
            <p className="text-primary-600/70 dark:text-primary-300/70 line-clamp-2">
              {displayEvent.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">{content.card.startDate}</p>
                <p className="text-sm text-primary-600/70 dark:text-primary-300/70 truncate">
                  {format(new Date(displayEvent.startDateTime), 'PPP')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">{content.card.endDate}</p>
                <p className="text-sm text-primary-600/70 dark:text-primary-300/70 truncate">
                  {format(new Date(displayEvent.endDateTime), 'PPP')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">Rooms</p>
                <p className="text-sm text-primary-600/70 dark:text-primary-300/70">
                  {displayEvent.rooms?.length || 0} rooms
                </p>
              </div>
            </div>
          </div>

          {canManageEvent && (
            <div className="absolute bottom-6 right-6 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-20">
              <Link href={`/events/${displayEvent.id || displayEvent._id}/manage`}>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30"
                >
                  <Settings className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}