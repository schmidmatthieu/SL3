import { isWithinInterval, startOfDay, endOfDay, getHours } from 'date-fns';
import { HOURS_IN_DAY, TIMELINE_CONFIG } from '../constants';
import { ViewMode } from '../types';

interface TimeCursorProps {
  currentDay: Date;
  viewMode: ViewMode;
  currentHourStart: number;
}

export const TimeCursor = ({ currentDay, viewMode = 'desktop', currentHourStart }: TimeCursorProps) => {
  const now = new Date();
  const isToday = isWithinInterval(now, {
    start: startOfDay(currentDay),
    end: endOfDay(currentDay),
  });

  if (!isToday) return null;

  const config = TIMELINE_CONFIG[viewMode];
  if (!config) return null;

  const cursorPosition = viewMode !== 'desktop'
    ? `${((getHours(now) - currentHourStart) / config.hoursVisible) * 100}%`
    : `${(getHours(now) / HOURS_IN_DAY) * 100}%`;

  const isVisible = viewMode === 'desktop' || (
    getHours(now) >= currentHourStart && 
    getHours(now) < currentHourStart + config.hoursVisible
  );

  if (!isVisible) return null;

  return (
    <div 
      className="current-time-cursor absolute top-0 bottom-0 w-px bg-primary/80 z-20"
      style={{ left: cursorPosition }}
    >
      <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
    </div>
  );
};
