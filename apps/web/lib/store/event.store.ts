import { eventService } from '@/lib/api/events';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Event } from '@/types/event';
import { Room } from '@/types/room';

interface EventState {
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

export const useEventStore = create<EventState>()(
  devtools(
    (set, get) => ({
      events: [],
      currentEvent: null,
      isLoading: false,
      error: null,

      fetchEvents: async () => {
        try {
          set({ isLoading: true, error: null });
          const events = await eventService.getAll();
          set({ events, isLoading: false });
        } catch (error: any) {
          console.error('Error fetching events:', error);
          set({ error: error.message || 'Failed to fetch events', isLoading: false });
          throw error;
        }
      },

      fetchMyEvents: async () => {
        try {
          set({ isLoading: true, error: null });
          const events = await eventService.getMyEvents();
          set({ events, isLoading: false });
        } catch (error: any) {
          console.error('Error fetching my events:', error);
          set({ error: error.message || 'Failed to fetch my events', isLoading: false });
          throw error;
        }
      },

      fetchEvent: async (idOrSlug: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log('Fetching event:', idOrSlug);
          const event = await eventService.getOne(idOrSlug);
          console.log('Fetched event:', event);
          set({ currentEvent: event, isLoading: false });
          return event;
        } catch (error: any) {
          console.error('Error fetching event:', error);
          set({
            error: error.message || 'Failed to fetch event',
            isLoading: false,
            currentEvent: null,
          });
          throw error;
        }
      },

      createEvent: async (data: Partial<Event>) => {
        try {
          set({ isLoading: true, error: null });
          const event = await eventService.create(data);
          set((state) => ({
            events: [...state.events, event],
            currentEvent: event,
            isLoading: false,
          }));
          return event;
        } catch (error: any) {
          console.error('Error creating event:', error);
          set({ error: error.message || 'Failed to create event', isLoading: false });
          throw error;
        }
      },

      updateEvent: async (idOrSlug: string, data: Partial<Event>) => {
        try {
          set({ isLoading: true, error: null });
          console.log('Updating event with data:', data);
          const updatedEvent = await eventService.update(idOrSlug, data);
          console.log('Received updated event:', updatedEvent);
          
          set((state) => {
            // Mise à jour de l'événement dans la liste
            const updatedEvents = state.events.map((event) =>
              event.id === updatedEvent.id || event._id === updatedEvent._id
                ? { ...event, ...updatedEvent }
                : event
            );

            // Si l'événement courant est celui qui est mis à jour
            const newCurrentEvent = state.currentEvent && 
              (state.currentEvent.id === updatedEvent.id || state.currentEvent._id === updatedEvent._id)
              ? { ...state.currentEvent, ...updatedEvent }
              : state.currentEvent;

            console.log('Updated state:', {
              events: updatedEvents,
              currentEvent: newCurrentEvent
            });

            return {
              events: updatedEvents,
              currentEvent: newCurrentEvent,
              isLoading: false,
              error: null,
            };
          });

          return updatedEvent;
        } catch (error: any) {
          console.error('Error updating event:', error);
          set({
            error: error.message || 'Failed to update event',
            isLoading: false,
          });
          throw error;
        }
      },

      updateEventStatus: async (idOrSlug: string, status: Event['status']) => {
        try {
          set({ isLoading: true, error: null });
          const updatedEvent = await eventService.updateStatus(idOrSlug, status);
          set((state) => ({
            events: state.events.map((event) =>
              event.id === updatedEvent.id ? updatedEvent : event
            ),
            currentEvent: updatedEvent,
            isLoading: false,
          }));
          return updatedEvent;
        } catch (error: any) {
          console.error('Error updating event status:', error);
          set({
            error: error.message || 'Failed to update event status',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteEvent: async (idOrSlug: string) => {
        try {
          set({ isLoading: true, error: null });
          await eventService.delete(idOrSlug);
          set((state) => ({
            events: state.events.filter((event) => 
              event.id !== idOrSlug && event._id !== idOrSlug && event.slug !== idOrSlug
            ),
            currentEvent: state.currentEvent && 
              (state.currentEvent.id === idOrSlug || 
               state.currentEvent._id === idOrSlug || 
               state.currentEvent.slug === idOrSlug) 
              ? null 
              : state.currentEvent,
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          console.error('Error deleting event:', error);
          set({ error: error.message || 'Failed to delete event', isLoading: false });
          throw error;
        }
      },

      createRoom: async (idOrSlug: string, roomData: Partial<Room>) => {
        try {
          set({ isLoading: true, error: null });
          const room = await eventService.createRoom(idOrSlug, roomData);
          const currentEvent = get().currentEvent;
          if (currentEvent) {
            const updatedEvent = {
              ...currentEvent,
              rooms: [...(currentEvent.rooms || []), room],
            };
            set((state) => ({
              events: state.events.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
              ),
              currentEvent: updatedEvent,
              isLoading: false,
            }));
          }
          return room;
        } catch (error: any) {
          console.error('Error creating room:', error);
          set({ error: error.message || 'Failed to create room', isLoading: false });
          throw error;
        }
      },

      reset: () => {
        set({
          events: [],
          currentEvent: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'event-store',
    }
  )
);
