'use client';

import Link from 'next/link';
import { Room } from '@/types/room';
import { Event } from '@/types/event';
import { cn } from '@/lib/utils';
import { HOURS_IN_DAY, TIMELINE_CONFIG } from '../constants';
import { ViewMode } from '../types';
import { differenceInMinutes, isWithinInterval, startOfDay, endOfDay, format, getHours, getMinutes, setHours, setMinutes } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface RoomItemProps {
  room: Room;
  event: Event;
  currentDay: Date;
  rowIndex: number;
  viewMode: ViewMode;
  currentHourStart: number;
}

const getStatusColor = (status: Room['status']) => {
  switch (status) {
    case 'live':
      return 'bg-third text-black';
    case 'upcoming':
      return 'bg-blue-500 text-white dark:bg-blue-600';
    case 'paused':
      return 'bg-yellow-500 text-black';
    case 'ended':
      return 'bg-secondary-200 text-black';
    case 'cancelled':
      return 'bg-destructive text-destructive-foreground dark:bg-destructive/90';
    default:
      return 'bg-secondary text-black';
  }
};

export const RoomItem = ({ 
  room, 
  event, 
  currentDay,
  rowIndex,
  viewMode,
  currentHourStart 
}: RoomItemProps) => {
  const startTime = new Date(room.startTime);
  const endTime = new Date(room.endTime);
  const isCancelled = room.status === 'cancelled';

  // Créer des dates pour le jour actuel avec les heures de début et de fin
  const currentDayStart = startOfDay(currentDay);
  const currentDayEnd = endOfDay(currentDay);

  // Vérifier si la room est sur plusieurs jours
  const isMultiDay = !isWithinInterval(startTime, {
    start: currentDayStart,
    end: currentDayEnd
  }) || !isWithinInterval(endTime, {
    start: currentDayStart,
    end: currentDayEnd
  });

  // Déterminer les heures de début et de fin effectives pour le jour actuel
  let effectiveStartTime = startTime;
  let effectiveEndTime = endTime;

  if (isMultiDay) {
    if (!isWithinInterval(startTime, { start: currentDayStart, end: currentDayEnd })) {
      // Si l'heure de début est avant le jour actuel, utiliser minuit (00:00)
      effectiveStartTime = setMinutes(setHours(currentDayStart, 0), 0);
    }
    if (!isWithinInterval(endTime, { start: currentDayStart, end: currentDayEnd })) {
      // Si l'heure de fin est après le jour actuel, utiliser 23:59
      effectiveEndTime = setMinutes(setHours(currentDayEnd, 23), 59);
    }
  }

  // Calculer la position et la largeur pour la vue adaptative
  const hourPosition = viewMode !== 'desktop'
    ? (getHours(effectiveStartTime) + getMinutes(effectiveStartTime) / 60 - currentHourStart) / TIMELINE_CONFIG[viewMode].hoursVisible
    : (getHours(effectiveStartTime) + getMinutes(effectiveStartTime) / 60) / HOURS_IN_DAY;
  
  const hourWidth = viewMode !== 'desktop'
    ? (differenceInMinutes(effectiveEndTime, effectiveStartTime) / 60) / TIMELINE_CONFIG[viewMode].hoursVisible
    : (differenceInMinutes(effectiveEndTime, effectiveStartTime) / 60) / HOURS_IN_DAY;

  let position = hourPosition * 100;
  let width = hourWidth * 100;

  position = Math.max(0, position);
  width = Math.min(100 - position, width);

  // Vérifier si l'événement est visible dans la plage horaire actuelle
  const isStartDay = isWithinInterval(startTime, {
    start: currentDayStart,
    end: currentDayEnd
  });

  const isEndDay = isWithinInterval(endTime, {
    start: currentDayStart,
    end: currentDayEnd
  });

  const { t } = useTranslation('components/event-detail');

  return (
    <Link
      href={isCancelled ? '#' : `/events/${event.id || event._id}/rooms/${room.id || room._id}`}
      className={cn(
        'absolute h-8 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:opacity-90',
        getStatusColor(room.status),
        isCancelled && 'cursor-not-allowed opacity-50',
        isMultiDay && (isStartDay ? 'rounded-r-none' : 'rounded-l-none'),
        isMultiDay && !isStartDay && !isEndDay && 'rounded-none'
      )}
      style={{
        left: `${position}%`,
        width: `${width}%`,
        top: `${46 + rowIndex * 40}px`,
      }}
      onClick={(e) => {
        if (isCancelled) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex items-center h-full">
        <span className="truncate">
          {room.name}
          {isMultiDay && (
            <span className="ml-2 opacity-75">
              {isStartDay 
                ? `→ ${t('timeline.multiDay.endsOn')} ${format(endTime, 'dd.MM')} ${t('timeline.multiDay.at')} ${format(endTime, 'HH:mm')}`
                : isEndDay 
                  ? `${t('timeline.multiDay.startsOn')} ${format(startTime, 'dd.MM')} ${t('timeline.multiDay.at')} ${format(startTime, 'HH:mm')} →`
                  : `${format(startTime, 'dd.MM')} → ${format(endTime, 'dd.MM')}`}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
};
