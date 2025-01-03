import { isSameDay, isAfter, startOfDay, endOfDay, getHours, getMinutes, differenceInMinutes } from 'date-fns';
import { HOURS_IN_DAY } from '../constants';

export const calculatePosition = (time: Date, currentDay: Date) => {
  // Si la date est différente du jour courant et c'est le jour suivant
  if (!isSameDay(time, currentDay) && isAfter(startOfDay(time), endOfDay(currentDay))) {
    return 0; // Position au début de la timeline
  }
  
  const timeHours = getHours(time) + getMinutes(time) / 60;
  return (timeHours / HOURS_IN_DAY) * 100;
};

export const calculateWidth = (startTime: Date, endTime: Date, currentDay: Date) => {
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
    // Si on est sur un jour intermédiaire
    else {
      width = 100;
    }
  }
  
  return Math.min(width || 0, 100); // Ne pas dépasser 100%
};
