'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isSameDay, differenceInMinutes, addMinutes, setHours, eachDayOfInterval, startOfWeek, endOfWeek, isWithinInterval, differenceInDays, startOfDay, endOfDay, getHours, getMinutes, isAfter, isBefore } from 'date-fns';
import { fr, enUS, de, it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { Event } from '@/types/event';
import { Room } from '@/types/room';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTimelineStore } from '@/store/timeline-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCALES = { fr, en: enUS, de, it };

interface TimelineProps {
  event: Event;
}

// Constantes pour la timeline
const HOUR_START = 0;
const HOUR_END = 24;
const HOURS_IN_DAY = HOUR_END - HOUR_START;

// Configuration des vues selon la taille d'écran
const TIMELINE_CONFIG = {
  desktop: {
    breakpoint: 1920,
    hoursVisible: 24
  },
  laptop: {
    breakpoint: 1280,
    hoursVisible: 12
  },
  tablet: {
    breakpoint: 768,
    hoursVisible: 6
  },
  mobile: {
    breakpoint: 0,
    hoursVisible: 4
  }
} as const;

// Fonction pour calculer la position horizontale
const calculatePosition = (time: Date, currentDay: Date) => {
  // Si la date est différente du jour courant et c'est le jour suivant
  if (!isSameDay(time, currentDay) && isAfter(startOfDay(time), endOfDay(currentDay))) {
    return 0; // Position au début de la timeline
  }
  
  const timeHours = getHours(time) + getMinutes(time) / 60;
  return (timeHours / HOURS_IN_DAY) * 100;
};

// Fonction pour calculer la largeur
const calculateWidth = (startTime: Date, endTime: Date, currentDay: Date) => {
  let width;
  
  // Si l'événement commence et finit le même jour
  if (isSameDay(startTime, endTime)) {
    const durationHours = differenceInMinutes(endTime, startTime) / 60;
    width = (durationHours / HOURS_IN_DAY) * 100;
  }
  // Si l'événement chevauche minuit
  else {
    // Si on est sur le jour de début
    if (isSameDay(currentDay, startTime)) {
      const hoursUntilMidnight = differenceInMinutes(endOfDay(startTime), startTime) / 60;
      width = (hoursUntilMidnight / HOURS_IN_DAY) * 100;
    }
    // Si on est sur le jour de fin
    else if (isSameDay(currentDay, endTime)) {
      const hoursFromMidnight = (getHours(endTime) + getMinutes(endTime) / 60);
      width = (hoursFromMidnight / HOURS_IN_DAY) * 100;
    }
  }
  
  return Math.min(width, 100); // Ne pas dépasser 100%
};

export function Timeline({ event }: TimelineProps) {
  const { t, i18n } = useTranslation('components/event-detail');
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<keyof typeof TIMELINE_CONFIG>('desktop');
  const [currentHourStart, setCurrentHourStart] = useState(8);
  
  const {
    zoom,
    setZoom,
    minZoom,
    maxZoom,
    currentDate,
    setCurrentDate,
    navigateForward,
    navigateBackward,
    goToNow,
    visibleTimeStart,
    visibleTimeEnd,
    setEventDates,
    eventStartDate,
    eventEndDate,
  } = useTimelineStore();

  // Initialiser les dates de l'événement pour la navigation
  useEffect(() => {
    setEventDates(new Date(event.startDateTime), new Date(event.endDateTime));
  }, [event.startDateTime, event.endDateTime, setEventDates]);

  // Détecter la taille d'écran et définir le mode de vue
  useEffect(() => {
    const checkViewMode = () => {
      const width = window.innerWidth;
      if (width >= TIMELINE_CONFIG.desktop.breakpoint) {
        setViewMode('desktop');
      } else if (width >= TIMELINE_CONFIG.laptop.breakpoint) {
        setViewMode('laptop');
      } else if (width >= TIMELINE_CONFIG.tablet.breakpoint) {
        setViewMode('tablet');
      } else {
        setViewMode('mobile');
      }
    };
    
    checkViewMode();
    window.addEventListener('resize', checkViewMode);
    
    return () => window.removeEventListener('resize', checkViewMode);
  }, []);

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

  // Gérer le zoom avec la molette de la souris
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
        setZoom(newZoom);
      }
    };

    const container = timelineRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoom, setZoom, minZoom, maxZoom]);

  const navigateHours = (direction: 'forward' | 'backward') => {
    const hoursVisible = TIMELINE_CONFIG[viewMode].hoursVisible;
    setCurrentHourStart(prev => {
      const newStart = direction === 'forward' 
        ? prev + hoursVisible 
        : prev - hoursVisible;
      
      return Math.max(0, Math.min(24 - hoursVisible, newStart));
    });
  };

  const getVisibleHours = () => {
    if (viewMode === 'desktop') {
      return Array.from({ length: HOURS_IN_DAY });
    }
    
    return Array.from({ length: TIMELINE_CONFIG[viewMode].hoursVisible });
  };

  // Calculer les jours à afficher
  const getVisibleDays = () => {
    return [currentDate];
  };

  const daysToShow = useMemo(() => {
    return getVisibleDays();
  }, [currentDate]);

  // Fonction pour organiser les rooms en lignes
  const organizeRoomsInRows = (rooms: Room[]) => {
    if (!rooms?.length) return [];

    // Trier les rooms par heure de début
    const sortedRooms = [...rooms].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const rows: Room[][] = [];
    
    sortedRooms.forEach(room => {
      const roomStart = new Date(room.startTime);
      const roomEnd = new Date(room.endTime);
      
      // Chercher une ligne existante où on peut placer la room
      let availableRow = -1;
      
      // En mode non-desktop, on vérifie aussi la visibilité dans la tranche horaire
      const isVisibleInTimeSlot = viewMode === 'desktop' || (() => {
        const startHour = getHours(roomStart) + getMinutes(roomStart) / 60;
        const endHour = getHours(roomEnd) + getMinutes(roomEnd) / 60;
        const visibleHours = TIMELINE_CONFIG[viewMode].hoursVisible;
        
        return !(startHour >= currentHourStart + visibleHours || endHour <= currentHourStart);
      })();

      if (isVisibleInTimeSlot) {
        availableRow = rows.findIndex(row => {
          // Vérifier le chevauchement avec toutes les rooms de la ligne
          return !row.some(existingRoom => {
            const existingStart = new Date(existingRoom.startTime);
            const existingEnd = new Date(existingRoom.endTime);
            
            // En mode non-desktop, on ne considère que la portion visible
            if (viewMode !== 'desktop') {
              const startHour = Math.max(currentHourStart, getHours(roomStart) + getMinutes(roomStart) / 60);
              const endHour = Math.min(
                currentHourStart + TIMELINE_CONFIG[viewMode].hoursVisible,
                getHours(roomEnd) + getMinutes(roomEnd) / 60
              );
              const existingStartHour = Math.max(currentHourStart, getHours(existingStart) + getMinutes(existingStart) / 60);
              const existingEndHour = Math.min(
                currentHourStart + TIMELINE_CONFIG[viewMode].hoursVisible,
                getHours(existingEnd) + getMinutes(existingEnd) / 60
              );
              
              return startHour < existingEndHour && endHour > existingStartHour;
            }
            
            // En mode desktop, on vérifie le chevauchement complet
            return roomStart < existingEnd && roomEnd > existingStart;
          });
        });
      }

      if (availableRow !== -1) {
        // Ajouter à une ligne existante
        rows[availableRow].push(room);
      } else if (isVisibleInTimeSlot) {
        // Créer une nouvelle ligne seulement si la room est visible
        rows.push([room]);
      }
    });

    return rows;
  };

  // Calculer la hauteur en fonction des lignes nécessaires
  const roomRows = useMemo(() => organizeRoomsInRows(event.rooms), [
    event.rooms,
    viewMode,
    currentHourStart
  ]);

  const timelineHeight = useMemo(() => {
    const rowCount = roomRows.length;
    // 32px par ligne + 40px pour l'en-tête + 40px de padding en bas
    return Math.max((rowCount * 32) + 40 + 40, 200);
  }, [roomRows.length]);

  const canNavigateBack = useMemo(() => {
    return !isSameDay(currentDate, eventStartDate);
  }, [currentDate, eventStartDate]);

  const canNavigateForward = useMemo(() => {
    return !isSameDay(currentDate, eventEndDate);
  }, [currentDate, eventEndDate]);

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

  const locale = LOCALES[i18n.language as keyof typeof LOCALES] || enUS;

  const RoomItem = ({ room, event, position, width, index }: {
    room: Room;
    event: Event;
    position: number;
    width: number;
    index: number;
  }) => {
    const isCancelled = room.status === 'cancelled';
    const startTime = new Date(room.startTime);
    const endTime = new Date(room.endTime);
    const isMultiDay = !isSameDay(startTime, endTime);
    const isStartDay = isSameDay(startTime, currentDate);
    const isEndDay = isSameDay(endTime, currentDate);
    
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

    return (
      <Link
        href={isCancelled ? '#' : `/events/${event._id}/rooms/${room._id}`}
        className={cn(
          'absolute h-8 rounded-md px-2 py-1 text-xs font-medium transition-colors',
          getStatusColor(room.status),
          isCancelled && 'cursor-not-allowed opacity-50',
          isMultiDay && (isStartDay ? 'rounded-r-none' : 'rounded-l-none'),
          isMultiDay && !isStartDay && !isEndDay && 'rounded-none'
        )}
        style={{
          left: isStartDay ? `${position}%` : '0%',
          width: isMultiDay
            ? isStartDay
              ? `${((24 - getHours(startTime) - getMinutes(startTime) / 60) / 24) * 100}%`
              : isEndDay
                ? `${((getHours(endTime) + getMinutes(endTime) / 60) / 24) * 100}%`
                : '100%'
            : `${width}%`,
          top: `${40 + index * 40}px`,
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

  return (
    <section className="py-6">
      <div className="container max-w-[1400px] pl-6">
        <div className="flex flex-col gap-4">
          {/* En-tête avec contrôles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateBackward}
                  disabled={!canNavigateBack}
                  className={cn(!canNavigateBack && 'opacity-50')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateForward}
                  disabled={!canNavigateForward}
                  className={cn(!canNavigateForward && 'opacity-50')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNow}
                className="h-8 select-none"
              >
                {t('timeline.today')}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {viewMode !== 'desktop' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateHours('backward')}
                    disabled={currentHourStart === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Select
                    value={currentHourStart.toString()}
                    onValueChange={(value) => setCurrentHourStart(parseInt(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue>
                        {`${currentHourStart}h-${currentHourStart + TIMELINE_CONFIG[viewMode].hoursVisible}h`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.floor(24 / TIMELINE_CONFIG[viewMode].hoursVisible) }).map((_, i) => {
                        const start = i * TIMELINE_CONFIG[viewMode].hoursVisible;
                        const end = Math.min(start + TIMELINE_CONFIG[viewMode].hoursVisible, 24);
                        return (
                          <SelectItem key={start} value={start.toString()}>
                            {`${start}h-${end}h`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateHours('forward')}
                    disabled={currentHourStart >= 24 - TIMELINE_CONFIG[viewMode].hoursVisible}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="text-sm text-primary-600 dark:text-primary-300 font-semibold">
                {format(currentDate, 'EEEE d MMMM', { locale })}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div 
            ref={containerRef}
            className="rounded-xl border border-border/50 overflow-hidden select-none"
          >
            <div 
              ref={timelineRef}
              className="relative bg-muted/30 rounded-lg overflow-hidden"
              style={{
                height: `${timelineHeight}px`,
                minHeight: viewMode !== 'desktop' ? '400px' : '200px', // Hauteur minimum plus grande en mode non-desktop
              }}
            >
              {/* En-tête avec les heures */}
              <div className="sticky top-0 border-b border-border/50 bg-background/30 backdrop-blur-sm">
                <div className="flex">
                  {getVisibleHours().map((_, i) => {
                    const hour = viewMode !== 'desktop' ? currentHourStart + i : i;
                    return (
                      <div
                        key={hour}
                        className="flex-1 text-xs text-muted-foreground p-2 text-center border-r border-border/50 last:border-r-0"
                      >
                        {`${String(hour).padStart(2, '0')}:00`}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grille des heures */}
              <div
                className="absolute inset-0"
                style={{
                  width: '100%',
                }}
              >
                {getVisibleHours().map((_, i) => {
                  const hour = viewMode !== 'desktop' ? currentHourStart + i : i;
                  return (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-l border-border/10"
                      style={{
                        left: `${((i) / (viewMode === 'desktop' ? HOURS_IN_DAY : TIMELINE_CONFIG[viewMode].hoursVisible)) * 100}%`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Curseur de temps actuel */}
              {isWithinInterval(new Date(), { start: visibleTimeStart, end: visibleTimeEnd }) && (
                <div 
                  className="current-time-cursor absolute top-0 bottom-0 w-px bg-primary/80 z-20"
                  style={{ 
                    left: viewMode !== 'desktop'
                      ? `${((getHours(new Date()) - currentHourStart) / TIMELINE_CONFIG[viewMode].hoursVisible) * 100}%`
                      : `${(getHours(new Date()) / HOURS_IN_DAY) * 100}%`,
                    display: viewMode !== 'desktop' && (getHours(new Date()) < currentHourStart || getHours(new Date()) >= currentHourStart + TIMELINE_CONFIG[viewMode].hoursVisible) ? 'none' : 'block'
                  }}
                >
                  <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                </div>
              )}

              {/* Salles */}
              {roomRows.map((row, rowIndex) => 
                row.map(room => {
                  const startTime = new Date(room.startTime);
                  const endTime = new Date(room.endTime);
                  
                  // En mode jour, on vérifie si la salle chevauche le jour actuel
                  const isVisible = isWithinInterval(startTime, {
                    start: startOfDay(currentDate),
                    end: endOfDay(currentDate)
                  }) || isWithinInterval(endTime, {
                    start: startOfDay(currentDate),
                    end: endOfDay(currentDate)
                  }) || (
                    // Cas où l'événement englobe complètement le jour actuel
                    isBefore(startTime, startOfDay(currentDate)) &&
                    isAfter(endTime, endOfDay(currentDate))
                  );

                  if (!isVisible) return null;

                  // Calculer la position et la largeur pour la vue adaptative
                  const hourPosition = viewMode !== 'desktop'
                    ? (getHours(startTime) + getMinutes(startTime) / 60 - currentHourStart) / TIMELINE_CONFIG[viewMode].hoursVisible
                    : (getHours(startTime) + getMinutes(startTime) / 60) / HOURS_IN_DAY;
                  
                  const hourWidth = viewMode !== 'desktop'
                    ? (differenceInMinutes(endTime, startTime) / 60) / TIMELINE_CONFIG[viewMode].hoursVisible
                    : (differenceInMinutes(endTime, startTime) / 60) / HOURS_IN_DAY;

                  // Ne pas afficher si l'événement est complètement en dehors de la plage visible
                  if (viewMode !== 'desktop') {
                    const startHour = getHours(startTime) + getMinutes(startTime) / 60;
                    const endHour = getHours(endTime) + getMinutes(endTime) / 60;
                    const visibleHours = TIMELINE_CONFIG[viewMode].hoursVisible;
                    
                    if (startHour >= currentHourStart + visibleHours || endHour <= currentHourStart) {
                      return null;
                    }
                  }

                  return (
                    <RoomItem
                      key={room._id}
                      room={room}
                      event={event}
                      position={Math.max(0, hourPosition * 100)}
                      width={Math.min(100, hourWidth * 100)}
                      index={rowIndex}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
