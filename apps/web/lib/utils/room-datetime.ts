import { addHours } from 'date-fns';

/**
 * Retourne l'heure ronde suivante
 * @param date Date de référence
 * @returns Date avec l'heure ronde suivante
 */
export function getNextRoundHour(date: Date = new Date()): Date {
  const roundedDate = new Date(date);
  roundedDate.setMinutes(0);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  
  // Si nous sommes déjà passé dans l'heure actuelle, passer à l'heure suivante
  if (date.getMinutes() > 0) {
    roundedDate.setHours(roundedDate.getHours() + 1);
  }
  
  return roundedDate;
}

/**
 * Retourne une plage horaire par défaut avec des heures rondes
 * @param defaultDuration Durée par défaut en heures
 * @returns Objet contenant les dates/heures de début et de fin
 */
export function getDefaultRoomTimes(defaultDuration: number = 2) {
  const startDate = getNextRoundHour();
  const endDate = addHours(startDate, defaultDuration);

  return {
    startDate,
    endDate,
    startTime: `${startDate.getHours().toString().padStart(2, '0')}:00`,
    endTime: `${endDate.getHours().toString().padStart(2, '0')}:00`
  };
}

/**
 * Combine une date et une heure pour créer un objet Date
 * @param date Date de base
 * @param time Heure au format "HH:mm"
 * @returns Date combinée
 */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);
  return combinedDate;
}
