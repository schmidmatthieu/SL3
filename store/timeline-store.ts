import { create } from 'zustand';
import {
  startOfDay,
  addDays,
  subDays,
  isSameDay,
  setHours,
} from 'date-fns';

interface TimelineState {
  currentDate: Date;
  visibleTimeStart: Date;
  visibleTimeEnd: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  
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
  currentDate: new Date(),
  visibleTimeStart: new Date(),
  visibleTimeEnd: new Date(),
  eventStartDate: new Date(),
  eventEndDate: new Date(),

  // Actions
  setCurrentDate: (date: Date) => {
    set({ currentDate: startOfDay(date) });
    get().updateVisibleTime();
  },

  navigateForward: () => {
    const { currentDate } = get();
    set({ currentDate: addDays(currentDate, 1) });
    get().updateVisibleTime();
  },

  navigateBackward: () => {
    const { currentDate } = get();
    set({ currentDate: subDays(currentDate, 1) });
    get().updateVisibleTime();
  },

  goToNow: () => {
    const now = new Date();
    set({ currentDate: startOfDay(now) });
    get().updateVisibleTime();
  },

  setEventDates: (start: Date, end: Date) => {
    set({
      eventStartDate: startOfDay(start),
      eventEndDate: startOfDay(end),
    });
    get().updateVisibleTime();
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
      backward: !isSameDay(currentDate, eventStartDate),
      forward: !isSameDay(currentDate, eventEndDate)
    };
  },
}));
