import { Event } from '@/types/event';
import { EventStoreActions } from '../types/event.store.types';
import { StateCreator } from 'zustand';

export const createEventStoreActions = (
  set: StateCreator<any>['set']
): EventStoreActions => ({
  setLoading: (isLoading: boolean) =>
    set({ isLoading, error: isLoading ? null : undefined }),

  setError: (error: string | null) =>
    set({ error, isLoading: error ? false : undefined }),

  setEvents: (events: Event[]) => set({ events }),

  setCurrentEvent: (event: Event | null) => set({ currentEvent: event }),

  updateEventInList: (updatedEvent: Event) =>
    set((state: { events: Event[] }) => ({
      events: state.events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    })),

  removeEventFromList: (idOrSlug: string) =>
    set((state: { events: Event[] }) => ({
      events: state.events.filter((event) => event.id !== idOrSlug),
      currentEvent: null,
    })),
});
