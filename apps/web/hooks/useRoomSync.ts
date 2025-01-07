import { useEffect } from 'react';

import { useEventStore } from '@/lib/store/event.store';
import { useRoomStore } from '@/lib/store/room.store';

export const useRoomSync = (eventSlug?: string) => {
  const roomStore = useRoomStore();
  const { rooms = [], fetchEventRooms, createRoom } = roomStore;
  const { event } = useEventStore();

  // Synchroniser les rooms quand l'eventSlug change
  useEffect(() => {
    if (!eventSlug) {
      return;
    }
    fetchEventRooms(eventSlug);
  }, [eventSlug, fetchEventRooms]);

  // Synchroniser les rooms quand l'event est mis à jour
  useEffect(() => {
    if (!event || !eventSlug || event.slug !== eventSlug) {
      return;
    }

    if (event.rooms && Array.isArray(event.rooms) && event.rooms.length !== rooms.length) {
      fetchEventRooms(eventSlug);
    }
  }, [event, eventSlug, rooms, fetchEventRooms]);

  return {
    rooms,
    createRoom,
    ...roomStore,
  };
};
