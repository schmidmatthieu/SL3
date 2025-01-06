import { useEffect } from 'react';

import { useEventStore } from '../store/event.store';

export const useEvents = (fetchOnMount = true) => {
  const {
    events,
    currentEvent,
    isLoading,
    error,
    fetchEvents,
    fetchMyEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
  } = useEventStore();

  useEffect(() => {
    if (fetchOnMount) {
      fetchEvents();
    }
  }, [fetchOnMount, fetchEvents]);

  return {
    events,
    currentEvent,
    isLoading,
    error,
    fetchEvents,
    fetchMyEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
  };
};
