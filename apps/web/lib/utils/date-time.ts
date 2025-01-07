/**
 * Retourne l'heure ronde suivante la plus proche
 * @param date Date de référence
 * @returns Date avec l'heure ronde suivante
 */
export function getNextRoundHour(date: Date = new Date()): Date {
  const roundedDate = new Date(date);
  roundedDate.setMinutes(0);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  
  // Ajouter une heure pour obtenir l'heure suivante
  roundedDate.setHours(roundedDate.getHours() + 1);
  
  return roundedDate;
}

/**
 * Retourne une plage horaire par défaut avec des heures rondes
 * @param defaultDuration Durée par défaut en heures
 * @returns Objet contenant les dates/heures de début et de fin
 */
export function getDefaultTimeRange(defaultDuration: number = 2) {
  const startDate = getNextRoundHour();
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + defaultDuration);

  return {
    startDate,
    endDate,
    startTime: `${startDate.getHours().toString().padStart(2, '0')}:00`,
    endTime: `${endDate.getHours().toString().padStart(2, '0')}:00`
  };
}
