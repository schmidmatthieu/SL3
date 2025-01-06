import { speakerService } from '@/services/api/speakers';
import { create } from 'zustand';
import { useRoomStore } from './room.store';

import { CreateSpeakerDto, Speaker, UpdateSpeakerDto } from '@/types/speaker';

interface SpeakerState {
  speakers: Speaker[];
  isLoading: boolean;
  error: string | null;
  getSpeakers: (eventId: string) => Promise<Speaker[] | void>;
  createSpeaker: (eventId: string, data: CreateSpeakerDto) => Promise<Speaker>;
  updateSpeaker: (eventId: string, speakerId: string, data: UpdateSpeakerDto) => Promise<Speaker>;
  deleteSpeaker: (eventId: string, speakerId: string) => Promise<void>;
  uploadImage: (eventId: string, speakerId: string, file: File) => Promise<string>;
}

export const useSpeakerStore = create<SpeakerState>((set, get) => ({
  speakers: [],
  isLoading: false,
  error: null,

  getSpeakers: async (eventId: string) => {
    console.log('SpeakerStore: Fetching speakers for event:', eventId);
    const currentState = get();
    
    // Toujours recharger les speakers pour assurer la synchronisation
    set({ isLoading: true, error: null });
    try {
      const speakers = await speakerService.getAll(eventId);
      console.log('SpeakerStore: Speakers received:', speakers);

      // Normaliser les IDs
      const normalizedSpeakers = speakers.map(speaker => ({
        ...speaker,
        id: speaker.id || speaker._id,
        _id: speaker._id || speaker.id,
      }));

      set({ speakers: normalizedSpeakers, isLoading: false });
      return normalizedSpeakers;
    } catch (error) {
      console.error('SpeakerStore: Error fetching speakers:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch speakers', isLoading: false });
      throw error;
    }
  },

  createSpeaker: async (eventId: string, data: CreateSpeakerDto) => {
    console.log('SpeakerStore: Creating speaker for event:', eventId);
    set({ isLoading: true, error: null });
    try {
      const speaker = await speakerService.create(eventId, {
        ...data,
        eventId,
      });
      console.log('SpeakerStore: Speaker created:', speaker);

      // Normaliser l'ID du nouveau speaker
      const normalizedSpeaker = {
        ...speaker,
        id: speaker.id || speaker._id,
        _id: speaker._id || speaker.id,
      };

      set(state => ({
        speakers: [...state.speakers, normalizedSpeaker],
        isLoading: false,
      }));

      // Mettre à jour le store des rooms
      if (data.rooms?.length) {
        const roomStore = useRoomStore.getState();
        const updatedRooms = roomStore.rooms.map(room => {
          if (data.rooms?.includes(room._id)) {
            return {
              ...room,
              speakers: [...(room.speakers || []), normalizedSpeaker._id],
            };
          }
          return room;
        });
        useRoomStore.setState({ rooms: updatedRooms });
      }

      return normalizedSpeaker;
    } catch (error) {
      console.error('SpeakerStore: Error creating speaker:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create speaker', isLoading: false });
      throw error;
    }
  },

  updateSpeaker: async (eventId: string, speakerId: string, data: UpdateSpeakerDto) => {
    console.log('SpeakerStore: Updating speaker for event:', eventId);
    set({ isLoading: true, error: null });
    try {
      const speaker = await speakerService.update(eventId, speakerId, data);
      console.log('SpeakerStore: Speaker updated:', speaker);

      // Mettre à jour le store des speakers
      set(state => ({
        speakers: state.speakers.map(s => (s._id === speakerId ? speaker : s)),
        isLoading: false,
      }));

      // Mettre à jour les rooms si nécessaire
      if (data.rooms) {
        const roomStore = useRoomStore.getState();
        const updatedRooms = roomStore.rooms.map(room => {
          const isSpeakerInRoom = data.rooms?.includes(room._id);
          const hasSpeaker = room.speakers?.includes(speakerId);

          if (isSpeakerInRoom && !hasSpeaker) {
            return {
              ...room,
              speakers: [...(room.speakers || []), speakerId],
            };
          } else if (!isSpeakerInRoom && hasSpeaker) {
            return {
              ...room,
              speakers: room.speakers?.filter(id => id !== speakerId) || [],
            };
          }
          return room;
        });

        useRoomStore.setState({ rooms: updatedRooms });
      }

      return speaker;
    } catch (error) {
      console.error('SpeakerStore: Error updating speaker:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update speaker', isLoading: false });
      throw error;
    }
  },

  deleteSpeaker: async (eventId: string, speakerId: string) => {
    set({ isLoading: true, error: null });
    try {
      await speakerService.delete(eventId, speakerId);
      set(state => ({
        speakers: state.speakers.filter(s => s._id !== speakerId),
        isLoading: false,
      }));

      // Retirer le speaker de toutes les rooms
      const roomStore = useRoomStore.getState();
      const updatedRooms = roomStore.rooms.map(room => ({
        ...room,
        speakers: room.speakers?.filter(id => id !== speakerId) || [],
      }));
      useRoomStore.setState({ rooms: updatedRooms });

    } catch (error) {
      console.error('SpeakerStore: Error deleting speaker:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete speaker', isLoading: false });
      throw error;
    }
  },

  uploadImage: async (eventId: string, speakerId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const { imageUrl } = await speakerService.uploadImage(eventId, speakerId, file);
      
      // Mettre à jour le speaker avec la nouvelle URL d'image
      set(state => ({
        speakers: state.speakers.map(s =>
          s._id === speakerId ? { ...s, imageUrl } : s
        ),
        isLoading: false,
      }));

      // Recharger tous les speakers pour s'assurer de la synchronisation
      await get().getSpeakers(eventId);
      
      return imageUrl;
    } catch (error) {
      console.error('SpeakerStore: Error uploading image:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to upload image', isLoading: false });
      throw error;
    }
  },
}));
