import { create } from 'zustand';
import {
  startOfDay,
  addDays,
  subDays,
  isSameDay,
  setHours,
  isWithinInterval,
} from 'date-fns';

const getCurrentTime = () => new Date('2025-01-07T11:50:18+01:00');

interface TimelineState {
  currentDate: Date;
  visibleTimeStart: Date;
  visibleTimeEnd: Date;
  eventStartDate: Date | null;
  eventEndDate: Date | null;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  navigateForward: () => void;
  navigateBackward: () => void;
  goToNow: () => void;
  setEventDates: (start: Date, end: Date) => void;
  
  // Getters
  getVisibleDays: () => Date[];
  canNavigate: () => { backward: boolean; forward: boolean };
  updateVisibleTime: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  // State
  currentDate: getCurrentTime(),
  visibleTimeStart: getCurrentTime(),
  visibleTimeEnd: getCurrentTime(),
  eventStartDate: null,
  eventEndDate: null,

  // Actions
  setCurrentDate: (date: Date) => {
    set({ currentDate: startOfDay(date) });
    get().updateVisibleTime();
  },

  navigateForward: () => {
    const { currentDate, eventEndDate } = get();
    if (!eventEndDate || !isSameDay(currentDate, eventEndDate)) {
      set({ currentDate: addDays(currentDate, 1) });
      get().updateVisibleTime();
    }
  },

  navigateBackward: () => {
    const { currentDate, eventStartDate } = get();
    if (!eventStartDate || !isSameDay(currentDate, eventStartDate)) {
      set({ currentDate: subDays(currentDate, 1) });
      get().updateVisibleTime();
    }
  },

  goToNow: () => {
    const now = getCurrentTime();
    set({ currentDate: startOfDay(now) });
    get().updateVisibleTime();
  },

  setEventDates: (start: Date, end: Date) => {
    const startDay = startOfDay(start);
    const endDay = startOfDay(end);
    const now = getCurrentTime();
    
    // Ne mettre à jour que si les dates ont changé
    if (!get().eventStartDate || !get().eventEndDate ||
        !isSameDay(get().eventStartDate, startDay) ||
        !isSameDay(get().eventEndDate, endDay)) {
      
      // Si l'événement est en cours, on commence à la date actuelle
      const isEventOngoing = isWithinInterval(now, { start, end });
      const initialDate = isEventOngoing ? now : start;
      
      set({
        eventStartDate: startDay,
        eventEndDate: endDay,
        currentDate: startOfDay(initialDate),
      });
      get().updateVisibleTime();
    }
  },

  // Getters
  getVisibleDays: () => {
    const { currentDate } = get();
    return [currentDate];
  },

  updateVisibleTime: () => {
    const { currentDate } = get();
    // On définit la plage horaire sur 24h complètes
    const start = setHours(currentDate, 0);
    start.setMinutes(0);
    const end = setHours(addDays(currentDate, 1), 0);
    set({ visibleTimeStart: start, visibleTimeEnd: end });
  },

  canNavigate: () => {
    const { currentDate, eventStartDate, eventEndDate } = get();
    return {
      backward: eventStartDate ? !isSameDay(currentDate, eventStartDate) : true,
      forward: eventEndDate ? !isSameDay(currentDate, eventEndDate) : true,
    };
  },
}));
