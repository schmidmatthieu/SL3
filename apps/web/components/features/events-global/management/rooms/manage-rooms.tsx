'use client';

import { useRoomSync } from '@/hooks/useRoomSync';
import { useRoomStore } from '@/lib/store/room.store';
import { useToast } from '@/components/core/ui/use-toast';
import { Spinner } from '@/components/core/ui/spinner';
import { CreateRoomForm } from './CreateRoomForm';
import { RoomList } from './RoomList';
import { Event } from '@/types/event';
import { RoomStatus } from '@/types/room';
import { CreateRoomFormData } from '@/types/room-management.types';

interface ManageRoomsProps {
  event: Event;
}

export function ManageRooms({ event }: ManageRoomsProps) {
  const roomStore = useRoomStore();
  const roomSync = useRoomSync(event.slug);
  const { rooms, fetchEventRooms } = roomSync;
  const { createRoom } = roomStore;
  const { toast } = useToast();

  const handleCreateRoom = async (formData: CreateRoomFormData) => {
    try {
      if (!formData.name) {
        toast({
          title: 'Error',
          description: 'Room name is required',
          variant: 'destructive',
        });
        return;
      }

      const start = new Date(formData.startDate);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      start.setHours(startHours, startMinutes);

      const end = new Date(formData.endDate);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      end.setHours(endHours, endMinutes);

      await createRoom({
        name: formData.name,
        eventSlug: event.slug,
        description: formData.description,
        thumbnail: formData.thumbnail,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'upcoming',
        settings: {
          isPublic: formData.isPublic,
          chatEnabled: formData.chatEnabled,
          recordingEnabled: formData.recordingEnabled,
          maxParticipants: parseInt(formData.capacity) || 100,
          allowQuestions: true,
          originalLanguage: formData.originalLanguage,
          availableLanguages: formData.availableLanguages,
        },
      });

      await fetchEventRooms(event.slug);

      toast({
        title: 'Success',
        description: 'Room created successfully',
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    }
  };

  const handleStreamControl = async (
    roomId: string | undefined,
    action: 'start' | 'pause' | 'stop' | 'end'
  ) => {
    try {
      if (!roomId) {
        console.error('Room ID is missing for stream control action:', action);
        toast({
          title: 'Erreur',
          description: 'Identifiant de salle manquant',
          variant: 'destructive',
        });
        return;
      }

      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        console.error('Room not found for ID:', roomId);
        toast({
          title: 'Erreur',
          description: 'Salle non trouvée',
          variant: 'destructive',
        });
        return;
      }

      let actionResult;
      switch (action) {
        case 'start':
          actionResult = await roomStore.startStream(roomId);
          break;
        case 'pause':
          actionResult = await roomStore.pauseStream(roomId);
          break;
        case 'stop':
          actionResult = await roomStore.stopStream(roomId);
          break;
        case 'end':
          actionResult = await roomStore.endStream(roomId);
          break;
      }

      // Rafraîchir la liste des salles
      await roomSync.fetchEventRooms(event.slug);

      toast({
        title: 'Succès',
        description: `Stream ${action === 'start' ? 'démarré' : action === 'pause' ? 'en pause' : action === 'stop' ? 'arrêté' : 'terminé'} avec succès`,
      });
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast({
        title: 'Erreur',
        description: `Impossible de ${action === 'start' ? 'démarrer' : action === 'pause' ? 'mettre en pause' : action === 'stop' ? 'arrêter' : 'terminer'} le stream: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleRoomStatusChange = async (roomId: string | undefined, status: RoomStatus) => {
    try {
      if (!roomId) {
        console.error('Room ID is missing for status change:', status);
        toast({
          title: 'Erreur',
          description: 'Identifiant de salle manquant',
          variant: 'destructive',
        });
        return;
      }

      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        console.error('Room not found for ID:', roomId);
        toast({
          title: 'Erreur',
          description: 'Salle non trouvée',
          variant: 'destructive',
        });
        return;
      }

      // Mise à jour du statut sans inclure eventSlug
      await roomStore.updateRoom(roomId, { status });

      // Rafraîchir la liste des salles
      await roomSync.fetchEventRooms(event.slug);

      toast({
        title: 'Succès',
        description: `Statut de la salle mis à jour: ${status}`,
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le statut de la salle: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRoom = async (roomId: string | undefined) => {
    try {
      if (!roomId) {
        console.error('Room ID is missing for deletion');
        toast({
          title: 'Erreur',
          description: 'Identifiant de salle manquant',
          variant: 'destructive',
        });
        return;
      }

      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        console.error('Room not found for ID:', roomId);
        toast({
          title: 'Erreur',
          description: 'Salle non trouvée',
          variant: 'destructive',
        });
        return;
      }

      await roomStore.deleteRoom(event.slug, roomId);
      await roomSync.fetchEventRooms(event.slug);

      toast({
        title: 'Succès',
        description: 'Salle supprimée avec succès',
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer la salle: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  if (roomSync.isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateRoomForm onSubmit={handleCreateRoom} />
      <RoomList
        rooms={rooms}
        onStreamControl={handleStreamControl}
        onStatusChange={handleRoomStatusChange}
        onDelete={handleDeleteRoom}
      />
    </div>
  );
}
