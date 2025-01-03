import { fr, enUS, de, it } from 'date-fns/locale';

export const HOUR_START = 0;
export const HOUR_END = 24;
export const HOURS_IN_DAY = HOUR_END - HOUR_START;

export const TIMELINE_CONFIG = {
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

export const LOCALES = { fr, en: enUS, de, it };
