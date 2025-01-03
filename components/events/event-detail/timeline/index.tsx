'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format, isWithinInterval, startOfDay, endOfDay, isBefore, isAfter, differenceInMinutes, getHours, getMinutes, isSameDay, eachDayOfInterval } from 'date-fns';

import { Event } from '@/types/event';
import { useTimelineStore } from '@/store/timeline-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TIMELINE_CONFIG, HOURS_IN_DAY, LOCALES } from './constants';
import { useTimelineView } from './hooks/use-timeline-view';
import { useTimelineHours } from './hooks/use-timeline-hours';
import { organizeRoomsInRows } from './utils/layout-utils';
import { TimeNavigation } from './components/time-navigation';
import { TimeHeader } from './components/time-header';
import { TimeGrid } from './components/time-grid';
import { TimeCursor } from './components/time-cursor';
import { TimeSelect } from './components/time-select';
import { RoomItem } from './components/room-item';

interface TimelineProps {
  event: Event;
}

export function Timeline({ event }: TimelineProps) {
  const { t, i18n } = useTranslation('components/event-detail');
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const viewMode = useTimelineView();
  const { currentHourStart, setCurrentHourStart, navigateHours } = useTimelineHours(viewMode, event);
  
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

  // Fonction pour organiser les rooms en lignes
  const organizeRoomsInRows = useMemo(() => {
    if (!event.rooms?.length) return [];

    // Filtrer d'abord les rooms visibles pour le jour et le créneau horaire actuel
    const visibleRooms = event.rooms.filter(room => {
      const startTime = new Date(room.startTime);
      const endTime = new Date(room.endTime);
      
      // Vérifier si la room est visible dans le jour actuel
      const isVisibleInDay = isWithinInterval(startTime, {
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

      if (!isVisibleInDay) return false;

      // En mode non-desktop, vérifier aussi la visibilité dans le créneau horaire
      if (viewMode !== 'desktop') {
        const startHour = getHours(startTime) + getMinutes(startTime) / 60;
        const endHour = getHours(endTime) + getMinutes(endTime) / 60;
        const visibleHours = TIMELINE_CONFIG[viewMode].hoursVisible;
        
        return !(startHour >= currentHourStart + visibleHours || endHour <= currentHourStart);
      }

      return true;
    });

    // Trier les rooms visibles par heure de début
    const sortedRooms = [...visibleRooms].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    if (viewMode !== 'desktop') {
      // En mode non-desktop, chaque room sur sa propre ligne
      return sortedRooms.map(room => [room]);
    }

    // En mode desktop, on peut avoir plusieurs rooms par ligne
    const rows: Room[][] = [];
    
    sortedRooms.forEach(room => {
      const roomStart = new Date(room.startTime);
      const roomEnd = new Date(room.endTime);
      
      // Chercher une ligne existante où on peut placer la room
      const availableRow = rows.findIndex(row => {
        // Vérifier le chevauchement avec toutes les rooms de la ligne
        return !row.some(existingRoom => {
          const existingStart = new Date(existingRoom.startTime);
          const existingEnd = new Date(existingRoom.endTime);
          
          return roomStart < existingEnd && roomEnd > existingStart;
        });
      });

      if (availableRow !== -1) {
        // Ajouter à une ligne existante
        rows[availableRow].push(room);
      } else {
        // Créer une nouvelle ligne
        rows.push([room]);
      }
    });

    return rows;
  }, [event.rooms, viewMode, currentDate, currentHourStart]);

  // Calculer le nombre maximum de lignes nécessaires pour tous les créneaux
  const maxRowCount = useMemo(() => {
    if (!event.rooms?.length) return 0;

    // Fonction pour obtenir les rooms visibles pour une date donnée
    const getVisibleRoomsForDate = (date: Date, hourStart: number = 0) => {
      return event.rooms.filter(room => {
        const startTime = new Date(room.startTime);
        const endTime = new Date(room.endTime);
        
        // Vérifier si la room est visible dans le jour
        const isVisibleInDay = isWithinInterval(startTime, {
          start: startOfDay(date),
          end: endOfDay(date)
        }) || isWithinInterval(endTime, {
          start: startOfDay(date),
          end: endOfDay(date)
        }) || (
          isBefore(startTime, startOfDay(date)) &&
          isAfter(endTime, endOfDay(date))
        );

        if (!isVisibleInDay) return false;

        // En mode non-desktop, vérifier la visibilité dans le créneau horaire
        if (viewMode !== 'desktop') {
          const startHour = getHours(startTime) + getMinutes(startTime) / 60;
          const endHour = getHours(endTime) + getMinutes(endTime) / 60;
          const visibleHours = TIMELINE_CONFIG[viewMode].hoursVisible;
          
          return !(startHour >= hourStart + visibleHours || endHour <= hourStart);
        }

        return true;
      });
    };

    // Obtenir toutes les dates de l'événement
    const dates = eachDayOfInterval({
      start: new Date(event.startDateTime),
      end: new Date(event.endDateTime)
    });

    // Pour chaque date, calculer le nombre de lignes nécessaires
    let maxLines = 0;

    dates.forEach(date => {
      if (viewMode !== 'desktop') {
        // En mode non-desktop, vérifier chaque créneau horaire possible
        for (let hour = 0; hour <= 24 - TIMELINE_CONFIG[viewMode].hoursVisible; hour++) {
          const visibleRooms = getVisibleRoomsForDate(date, hour);
          maxLines = Math.max(maxLines, visibleRooms.length);
        }
      } else {
        // En mode desktop, vérifier la journée entière
        const visibleRooms = getVisibleRoomsForDate(date);
        
        // En mode desktop, on peut avoir plusieurs rooms par ligne
        const rows: Room[][] = [];
        [...visibleRooms].sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ).forEach(room => {
          const roomStart = new Date(room.startTime);
          const roomEnd = new Date(room.endTime);
          
          const availableRow = rows.findIndex(row => {
            return !row.some(existingRoom => {
              const existingStart = new Date(existingRoom.startTime);
              const existingEnd = new Date(existingRoom.endTime);
              return roomStart < existingEnd && roomEnd > existingStart;
            });
          });

          if (availableRow !== -1) {
            rows[availableRow].push(room);
          } else {
            rows.push([room]);
          }
        });

        maxLines = Math.max(maxLines, rows.length);
      }
    });

    return maxLines;
  }, [event.rooms, event.startDateTime, event.endDateTime, viewMode]);

  // Calculer la hauteur en fonction du nombre maximum de lignes
  const timelineHeight = useMemo(() => {
    // 40px par ligne + 46px pour l'en-tête + 46px de padding en bas
    return Math.max((maxRowCount * 40) + 46 + 46, viewMode !== 'desktop' ? 200 : 100);
  }, [maxRowCount, viewMode]);

  const canNavigateBack = useMemo(() => {
    return eventStartDate && !isSameDay(currentDate, eventStartDate);
  }, [currentDate, eventStartDate]);

  const canNavigateForward = useMemo(() => {
    return eventEndDate && !isSameDay(currentDate, eventEndDate);
  }, [currentDate, eventEndDate]);

  const locale = LOCALES[i18n.language as keyof typeof LOCALES] || LOCALES.en;

  // Gérer le retour à maintenant
  const handleNowClick = useCallback(() => {
    const now = new Date();
    
    // Si on est déjà sur le jour actuel, on ajuste juste le créneau horaire
    if (isSameDay(currentDate, now)) {
      if (viewMode !== 'desktop') {
        const currentHour = getHours(now);
        // Trouver le meilleur créneau pour afficher l'heure actuelle
        const visibleHours = TIMELINE_CONFIG[viewMode].hoursVisible;
        const newHourStart = Math.max(0, Math.min(24 - visibleHours, currentHour - Math.floor(visibleHours / 2)));
        setCurrentHourStart(newHourStart);
      }
    } else {
      // Si on est sur un autre jour, on change de jour et on ajuste le créneau horaire
      setCurrentDate(now);
      if (viewMode !== 'desktop') {
        const currentHour = getHours(now);
        const visibleHours = TIMELINE_CONFIG[viewMode].hoursVisible;
        const newHourStart = Math.max(0, Math.min(24 - visibleHours, currentHour - Math.floor(visibleHours / 2)));
        setCurrentHourStart(newHourStart);
      }
    }
  }, [currentDate, viewMode, setCurrentDate, setCurrentHourStart]);

  return (
    <section className="py-6">
      <div className="container max-w-[1400px] pl-6">
        <div className="flex flex-col gap-4">
          {/* En-tête avec contrôles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={navigateBackward}
                disabled={!canNavigateBack}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={navigateForward}
                disabled={!canNavigateForward}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="default"
                onClick={handleNowClick}
              >
                {t('timeline.today')}
              </Button>

              <div className="text-sm font-medium">
                {format(currentDate, 'EEEE d MMMM yyyy', { locale: locale })}
              </div>
            </div>

            {/* Contrôles de navigation des heures */}
            {viewMode !== 'desktop' && (
              <TimeSelect
                currentHourStart={currentHourStart}
                viewMode={viewMode}
                navigateHours={navigateHours}
                setCurrentHourStart={setCurrentHourStart}
              />
            )}
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
                minHeight: viewMode !== 'desktop' ? '200px' : '100px',
              }}
            >
              {/* En-tête avec les heures */}
              <TimeHeader
                currentHourStart={currentHourStart}
                hoursVisible={TIMELINE_CONFIG[viewMode].hoursVisible}
              />

              {/* Grille des heures */}
              <TimeGrid
                currentHourStart={currentHourStart}
                hoursVisible={TIMELINE_CONFIG[viewMode].hoursVisible}
              />

              {/* Curseur de temps actuel */}
              <TimeCursor 
                currentDay={currentDate}
                viewMode={viewMode}
                currentHourStart={currentHourStart}
              />

              {/* Rooms */}
              {organizeRoomsInRows.map((row, rowIndex) =>
                row.map((room) => {
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
                      key={`${room.id || room._id}-${rowIndex}`}
                      room={room}
                      event={event}
                      currentDay={currentDate}
                      rowIndex={rowIndex}
                      viewMode={viewMode}
                      currentHourStart={currentHourStart}
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
