import { eventService } from '@/services/api/events';
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
  fetchEvent: (eventId: string) => Promise<Event | null>;
  createEvent: (data: Partial<Event>) => Promise<Event>;
  updateEvent: (eventId: string, data: Partial<Event>) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateEventStatus: (eventId: string, status: Event['status']) => Promise<Event>;
  createRoom: (eventId: string, roomData: Partial<Room>) => Promise<Room>;
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
        } catch (error) {
          console.error('Error fetching events:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchMyEvents: async () => {
        try {
          set({ isLoading: true, error: null });
          const events = await eventService.getMyEvents();
          set({ events, isLoading: false });
        } catch (error) {
          console.error('Error fetching my events:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchEvent: async (eventId: string) => {
        if (!eventId) {
          set({ error: 'Event ID is required', isLoading: false });
          return null;
        }

        try {
          set({ isLoading: true, error: null });
          const event = await eventService.getById(eventId);
          console.log('eventStore: Event data received', { event });
          
          if (!event) {
            throw new Error('Event not found');
          }

          set({ currentEvent: event, isLoading: false });
          return event;
        } catch (error) {
          console.error('eventStore: Error fetching event', { error });
          set({ error: error.message, isLoading: false, currentEvent: null });
          throw error;
        }
      },

      createEvent: async (data: Partial<Event>) => {
        try {
          set({ isLoading: true, error: null });
          const event = await eventService.create(data);
          set(state => ({
            events: [...state.events, event],
            currentEvent: event,
            isLoading: false,
          }));
          return event;
        } catch (error) {
          console.error('Error creating event:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateEvent: async (eventId: string, data: Partial<Event>) => {
        try {
          set({ isLoading: true, error: null });
          const updatedEvent = await eventService.update(eventId, data);
          set(state => ({
            events: state.events.map(event =>
              event.id === eventId ? { ...event, ...updatedEvent } : event
            ),
            currentEvent:
              state.currentEvent?.id === eventId
                ? { ...state.currentEvent, ...updatedEvent }
                : state.currentEvent,
            isLoading: false,
          }));
          return updatedEvent;
        } catch (error) {
          console.error('Error updating event:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateEventStatus: async (eventId: string, status: Event['status']) => {
        try {
          set({ isLoading: true, error: null });
          const updatedEvent = await eventService.updateStatus(eventId, status);
          set(state => ({
            events: state.events.map(event =>
              event.id === eventId ? { ...event, status: updatedEvent.status } : event
            ),
            currentEvent:
              state.currentEvent?.id === eventId
                ? { ...state.currentEvent, status: updatedEvent.status }
                : state.currentEvent,
            isLoading: false,
          }));
          return updatedEvent;
        } catch (error) {
          console.error('Error updating event status:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteEvent: async (eventId: string) => {
        try {
          set({ isLoading: true, error: null });
          await eventService.delete(eventId);
          set(state => ({
            events: state.events.filter(event => event.id !== eventId),
            currentEvent: state.currentEvent?.id === eventId ? null : state.currentEvent,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error deleting event:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      createRoom: async (eventId: string, roomData: Partial<Room>) => {
        try {
          set({ isLoading: true, error: null });
          const room = await eventService.createRoom(eventId, roomData);
          set(state => ({
            currentEvent: state.currentEvent
              ? {
                  ...state.currentEvent,
                  rooms: [...(state.currentEvent.rooms || []), room],
                }
              : null,
            isLoading: false,
          }));
          return room;
        } catch (error) {
          console.error('Error creating room:', error);
          set({ error: error.message, isLoading: false });
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
