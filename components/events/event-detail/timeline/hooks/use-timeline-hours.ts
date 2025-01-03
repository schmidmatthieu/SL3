import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { ViewMode } from '../types';
import { TIMELINE_CONFIG } from '../constants';

export const useTimelineHours = (viewMode: ViewMode, event: Event) => {
  const [currentHourStart, setCurrentHourStart] = useState(8);

  // Initialiser l'heure de début en fonction de l'événement
  useEffect(() => {
    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const hoursVisible = TIMELINE_CONFIG[viewMode].hoursVisible;

    // Si l'événement est en cours, centrer sur l'heure actuelle
    if (now >= start && now <= end) {
      const currentHour = now.getHours();
      setCurrentHourStart(Math.max(0, Math.min(24 - hoursVisible, currentHour - Math.floor(hoursVisible / 2))));
    } else {
      // Sinon, centrer sur l'heure de début de l'événement
      const startHour = start.getHours();
      setCurrentHourStart(Math.max(0, Math.min(24 - hoursVisible, startHour)));
    }
  }, [event.startDateTime, event.endDateTime, viewMode]);

  const navigateHours = (direction: 'forward' | 'backward') => {
    const hoursVisible = TIMELINE_CONFIG[viewMode].hoursVisible;
    setCurrentHourStart(prev => {
      const newStart = direction === 'forward' 
        ? prev + hoursVisible 
        : prev - hoursVisible;
      
      return Math.max(0, Math.min(24 - hoursVisible, newStart));
    });
  };

  return {
    currentHourStart,
    setCurrentHourStart: (hour: number) => {
      const hoursVisible = TIMELINE_CONFIG[viewMode].hoursVisible;
      setCurrentHourStart(Math.max(0, Math.min(24 - hoursVisible, hour)));
    },
    navigateHours,
  };
};
