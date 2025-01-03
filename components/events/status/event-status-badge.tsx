'use client';

import { cn } from '@/lib/utils';
import { Event } from '@/types/event';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { useEventStatus } from '@/hooks/useEventStatus';

interface EventStatusBadgeProps {
  event: Event;
  className?: string;
  showLabel?: boolean;
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

export function EventStatusBadge({ event, className, showLabel = true }: EventStatusBadgeProps) {
  const { t } = useTranslation();
  const currentStatus = useEventStatus(event);

  const getDisplayStatus = (status: string) => {
    const statusKey = status.toLowerCase();
    const translations = {
      live: t('events.status.live'),
      active: t('events.status.active'),
      scheduled: t('events.status.scheduled'),
      ended: t('events.status.ended'),
      draft: t('events.status.draft'),
      cancelled: t('events.status.cancelled'),
      postponed: t('events.status.postponed'),
    };

    return (
      translations[statusKey as keyof typeof translations] ||
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  return (
    <Badge
      className={cn(
        'font-medium pointer-events-none select-none',
        getStatusColor(currentStatus),
        className
      )}
    >
      {showLabel ? getDisplayStatus(currentStatus) : currentStatus}
    </Badge>
  );
}
