'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { useEventStatus } from './useEventStatus';

export function useEventWithStatus(initialEvent: Event) {
  const [event, setEvent] = useState(initialEvent);
  const currentStatus = useEventStatus(event);

  useEffect(() => {
    if (currentStatus !== event.status) {
      setEvent(prev => ({
        ...prev,
        status: currentStatus
      }));
    }
  }, [currentStatus, event.status]);

  useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  return event;
}
