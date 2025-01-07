import { parseISO } from 'date-fns';
import { Room } from '@/types/room';
import { isRoomVisible } from './date-utils';

export function organizeRoomsInRows(
  rooms: Room[],
  currentDate: Date,
  currentHourStart: number,
  viewMode: 'mobile' | 'tablet' | 'desktop'
): Room[][] {
  if (!rooms?.length) return [];

  // Filtrer les rooms visibles
  const visibleRooms = rooms.filter(room => 
    isRoomVisible(room, currentDate, currentHourStart, viewMode)
  );

  // Trier les rooms par heure de début
  const sortedRooms = [...visibleRooms].sort((a, b) => 
    parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
  );

  if (viewMode !== 'desktop') {
    // En mode non-desktop, chaque room sur sa propre ligne
    return sortedRooms.map(room => [room]);
  }

  // En mode desktop, on peut avoir plusieurs rooms par ligne
  const rows: Room[][] = [];
  
  sortedRooms.forEach(room => {
    const roomStart = parseISO(room.startTime);
    const roomEnd = parseISO(room.endTime);
    
    // Chercher une ligne existante où on peut placer la room
    const availableRow = rows.findIndex(row => {
      // Vérifier le chevauchement avec toutes les rooms de la ligne
      return !row.some(existingRoom => {
        const existingStart = parseISO(existingRoom.startTime);
        const existingEnd = parseISO(existingRoom.endTime);
        
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
}

export function getMaxRowCount(
  rooms: Room[],
  dates: Date[],
  viewMode: 'mobile' | 'tablet' | 'desktop'
): number {
  if (!rooms?.length) return 0;

  return Math.max(
    ...dates.map(date => {
      const rows = organizeRoomsInRows(rooms, date, 0, viewMode);
      return rows.length;
    })
  );
}
