import { useEffect } from 'react';
import { useRoomStore } from '../store/room.store';
import { useEventStore } from '../store/event.store';

export const useRoomSync = (eventId: string) => {
  const roomStore = useRoomStore();
  const { rooms, fetchEventRooms, createRoom } = roomStore;
  const { event } = useEventStore();

  // Synchroniser les rooms quand l'eventId change
  useEffect(() => {
    if (eventId) {
      fetchEventRooms(eventId);
    }
  }, [eventId, fetchEventRooms]);

  // Synchroniser les rooms quand l'event est mis à jour
  useEffect(() => {
    if (event?.id === eventId && event.rooms?.length !== rooms.length) {
      fetchEventRooms(eventId);
    }
  }, [event, eventId, rooms.length, fetchEventRooms]);

  return {
    rooms,
    createRoom,
    ...roomStore // Retourner toutes les autres fonctions du store
  };
};
