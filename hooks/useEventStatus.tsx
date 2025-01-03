'use client';

import { useEffect, useState } from 'react';
import { Event } from '@/types/event';

export function useEventStatus(event: Event) {
  const [currentStatus, setCurrentStatus] = useState(event.status);

  const calculateStatus = () => {
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
    }, 10000); // 10000ms = 10 secondes pour un rafraîchissement plus fréquent

    return () => clearInterval(interval);
  }, [event.startDateTime, event.endDateTime, event.status, currentStatus]);

  return currentStatus;
}
