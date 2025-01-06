import { Event } from '@/types/event';

export interface EventCardProps {
  event: Event;
}

export interface EventContentType {
  status: {
    live: string;
    scheduled: string;
    ended: string;
    draft: string;
    cancelled: string;
    postponed: string;
    active: string;
  };
  card: {
    startDate: string;
    endDate: string;
    manageEvent: string;
    featured?: string;
  };
}
