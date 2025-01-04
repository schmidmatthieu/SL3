'use client';

import { useState, useEffect } from 'react';
import { Event, EventStatus } from '@/types/event';

export const useEventStatus = (event: Event): EventStatus => {
  const [currentStatus, setCurrentStatus] = useState<EventStatus>(event.status);

  const calculateStatus = (): EventStatus => {
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    // Si l'événement est annulé, garder ce statut
    if (event.status === 'cancelled') {
      return 'cancelled';
    }

    // Calculer le statut en fonction des dates
    if (now < startDate) {
      return 'scheduled';
    } else if (now > endDate) {
      return 'ended';
    } else {
      return 'active';
    }
  };

  useEffect(() => {
    // Calculer le statut initial
    const status = calculateStatus();
    setCurrentStatus(status);

    // Mettre à jour le statut toutes les minutes
    const interval = setInterval(() => {
      const newStatus = calculateStatus();
      if (newStatus !== currentStatus) {
        setCurrentStatus(newStatus);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [event.startDateTime, event.endDateTime, event.status]);

  return currentStatus;
};
