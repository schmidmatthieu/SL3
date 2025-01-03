import { Room } from '@/types/room';
import { ViewMode } from '../types';
import { TIMELINE_CONFIG } from '../constants';
import { getHours, getMinutes } from 'date-fns';

export const organizeRoomsInRows = (
  rooms: Room[],
  viewMode: ViewMode,
  currentHourStart: number,
  currentDay: Date
) => {
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
