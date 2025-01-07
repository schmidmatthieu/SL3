import { parseISO, isValid, isWithinInterval, startOfDay, endOfDay, isBefore, isAfter, getHours, getMinutes } from 'date-fns';
import { Room } from '@/types/room';
import { TIMELINE_CONFIG } from '../constants';

export function parseAndValidateDate(dateString: string): Date | null {
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
}

export function isRoomVisibleInDay(room: Room, currentDate: Date): boolean {
  const startTime = parseISO(room.startTime);
  const endTime = parseISO(room.endTime);
  
  return isWithinInterval(startTime, {
    start: startOfDay(currentDate),
    end: endOfDay(currentDate)
  }) || isWithinInterval(endTime, {
    start: startOfDay(currentDate),
    end: endOfDay(currentDate)
  }) || (
    isBefore(startTime, startOfDay(currentDate)) &&
    isAfter(endTime, endOfDay(currentDate))
  );
}

export function isRoomVisibleInTimeSlot(
  room: Room, 
  currentHourStart: number, 
  viewMode: 'mobile' | 'tablet' | 'desktop'
): boolean {
  const startTime = parseISO(room.startTime);
  const endTime = parseISO(room.endTime);
  
  const startHour = getHours(startTime) + getMinutes(startTime) / 60;
  const endHour = getHours(endTime) + getMinutes(endTime) / 60;
  const visibleHours = TIMELINE_CONFIG[viewMode].hoursVisible;
  
  return !(startHour >= currentHourStart + visibleHours || endHour <= currentHourStart);
}

export function isRoomVisible(
  room: Room, 
  currentDate: Date, 
  currentHourStart: number, 
  viewMode: 'mobile' | 'tablet' | 'desktop'
): boolean {
  const isVisibleInDay = isRoomVisibleInDay(room, currentDate);
  
  if (!isVisibleInDay) return false;
  
  if (viewMode !== 'desktop') {
    return isRoomVisibleInTimeSlot(room, currentHourStart, viewMode);
  }
  
  return true;
}
