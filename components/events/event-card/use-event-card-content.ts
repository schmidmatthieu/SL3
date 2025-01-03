'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EventContentType } from './types';

export function useEventCardContent() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const staticContent: EventContentType = {
    status: {
      live: 'Live',
      scheduled: 'Scheduled',
      ended: 'Ended',
      draft: 'Draft',
      cancelled: 'Cancelled',
      postponed: 'Postponed',
      active: 'Live',
    },
    card: {
      startDate: 'Start Date',
      endDate: 'End Date',
      manageEvent: 'Manage Event',
    },
  };

  const translatedContent: EventContentType = {
    status: {
      live: t('events.status.live'),
      scheduled: t('events.status.scheduled'),
      ended: t('events.status.ended'),
      draft: t('events.status.draft'),
      cancelled: t('events.status.cancelled'),
      postponed: t('events.status.postponed'),
      active: t('events.status.active'),
    },
    card: {
      startDate: t('events.card.startDate'),
      endDate: t('events.card.endDate'),
      manageEvent: t('events.card.manage'),
      featured: t('events.card.featured'),
    },
  };

  return {
    content: isClient ? translatedContent : staticContent,
    isClient,
  };
}
