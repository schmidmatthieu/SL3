import { Event } from '@/types/event';
import { Room } from '@/types/room';

export interface EventState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchMyEvents: () => Promise<void>;
  fetchEvent: (idOrSlug: string) => Promise<Event | null>;
  createEvent: (data: Partial<Event>) => Promise<Event>;
  updateEvent: (idOrSlug: string, data: Partial<Event>) => Promise<Event>;
  deleteEvent: (idOrSlug: string) => Promise<void>;
  updateEventStatus: (idOrSlug: string, status: Event['status']) => Promise<Event>;
  createRoom: (idOrSlug: string, roomData: Partial<Room>) => Promise<Room>;
  reset: () => void;
}

export interface EventStoreActions {
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  updateEventInList: (updatedEvent: Event) => void;
  removeEventFromList: (idOrSlug: string) => void;
}
