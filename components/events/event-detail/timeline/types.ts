import { Room } from '@/types/room';
import { TIMELINE_CONFIG } from './constants';

export interface TimeNavigationProps {
  currentDate: Date;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  navigateBackward: () => void;
  navigateForward: () => void;
  goToNow: () => void;
}

export interface TimeHeaderProps {
  currentHourStart: number;
  hoursVisible: number;
}

export interface TimeGridProps {
  currentHourStart: number;
  hoursVisible: number;
}

export interface TimeCursorProps {
  currentDay: Date;
}

export interface RoomItemProps {
  room: Room;
  event: Event;
  currentDay: Date;
  rowIndex: number;
}

// Type pour les modes de vue de la timeline
export type ViewMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export interface TimelineStore {
  zoom: number;
  setZoom: (zoom: number) => void;
  minZoom: number;
  maxZoom: number;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  navigateForward: () => void;
  navigateBackward: () => void;
  goToNow: () => void;
  visibleTimeStart: Date;
  visibleTimeEnd: Date;
  setEventDates: (startDate: Date, endDate: Date) => void;
  eventStartDate: Date | null;
  eventEndDate: Date | null;
}
