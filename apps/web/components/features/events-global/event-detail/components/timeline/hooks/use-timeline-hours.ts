import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { ViewMode } from '../types';
import { TIMELINE_CONFIG } from '../constants';

const getCurrentTime = () => new Date('2025-01-07T11:50:18+01:00');

const getInitialHourStart = (event: Event, viewMode: ViewMode): number => {
  const now = getCurrentTime();
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);
  const hoursVisible = TIMELINE_CONFIG[viewMode].hoursVisible;

  // Si l'événement est en cours, afficher l'heure actuelle
  if (now >= start && now <= end) {
    const currentHour = now.getHours();
    // Centrer la timeline autour de l'heure actuelle
    return Math.max(0, Math.min(24 - hoursVisible, currentHour - Math.floor(hoursVisible / 2)));
  }

  // Si l'événement n'a pas encore commencé ou est terminé, afficher le premier jour
  const startHour = start.getHours();
  return Math.max(0, Math.min(24 - hoursVisible, startHour));
};

export const useTimelineHours = (viewMode: ViewMode, event: Event) => {
  const [currentHourStart, setCurrentHourStart] = useState(() => 
    getInitialHourStart(event, viewMode)
  );

  // Mettre à jour l'heure de début lorsque l'événement ou le mode de vue change
  useEffect(() => {
    const newHourStart = getInitialHourStart(event, viewMode);
    setCurrentHourStart(newHourStart);
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
