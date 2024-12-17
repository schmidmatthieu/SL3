import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useAuthStore } from './auth-store';
import { Event } from '@/types/event';

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchMyEvents: () => Promise<void>;
  fetchEvent: (eventId: string) => Promise<void>;
  createEvent: (data: Partial<Event>) => Promise<Event>;
  updateEvent: (eventId: string, data: Partial<Event>) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateEventStatus: (eventId: string, status: Event['status']) => Promise<Event>;
  reset: () => void;
}

const getAuthHeaders = () => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

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
          const response = await fetch('/api/events', {
            headers: getAuthHeaders(),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to fetch events');
          }

          const events = await response.json();
          set({ events, isLoading: false });
        } catch (error) {
          console.error('Error fetching events:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchMyEvents: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/events/my', {
            headers: getAuthHeaders(),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to fetch my events');
          }

          const events = await response.json();
          set({ events, isLoading: false });
        } catch (error) {
          console.error('Error fetching my events:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchEvent: async (eventId: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/events/${eventId}`, {
            headers: getAuthHeaders(),
            credentials: 'include',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to fetch event');
          }

          const data = await response.json();
          const event: Event = {
            id: data._id || data.id,
            title: data.title,
            description: data.description,
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            imageUrl: data.imageUrl,
            status: data.status,
            rooms: data.rooms || 0,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          set({ currentEvent: event, isLoading: false });
        } catch (error) {
          console.error('Error fetching event:', error);
          set({ error: error.message, isLoading: false, currentEvent: null });
        }
      },

      createEvent: async (data: Partial<Event>) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/events', {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to create event');
          }

          const event = await response.json();
          const events = [...get().events, event];
          set({ events, isLoading: false });
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
          const response = await fetch(`/api/events/${eventId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to update event');
          }

          const updatedEvent = await response.json();
          const events = get().events.map(event =>
            event.id === eventId ? updatedEvent : event
          );
          set({ events, isLoading: false });
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
          const response = await fetch(`/api/events/${eventId}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify({ status }),
          });

          if (!response.ok) {
            throw new Error('Failed to update event status');
          }

          const updatedEvent = await response.json();
          const events = get().events.map(event =>
            event.id === eventId ? updatedEvent : event
          );
          set({ events, isLoading: false });
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
          const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to delete event');
          }

          const events = get().events.filter(event => event.id !== eventId);
          set({ events, isLoading: false });
        } catch (error) {
          console.error('Error deleting event:', error);
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
