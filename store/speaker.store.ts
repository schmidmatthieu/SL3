import { create } from 'zustand';
import { Speaker, CreateSpeakerDto, UpdateSpeakerDto } from '@/types/speaker';
import { speakerService } from '@/services/api/speakers';

interface SpeakerStore {
  speakers: Speaker[];
  isLoading: boolean;
  error: string | null;
  getSpeakers: (eventId: string) => Promise<void>;
  createSpeaker: (eventId: string, data: CreateSpeakerDto) => Promise<Speaker>;
  updateSpeaker: (eventId: string, speakerId: string, data: UpdateSpeakerDto) => Promise<Speaker>;
  deleteSpeaker: (eventId: string, speakerId: string) => Promise<void>;
  uploadImage: (eventId: string, speakerId: string, file: File) => Promise<string>;
}

export const useSpeakerStore = create<SpeakerStore>((set, get) => ({
  speakers: [],
  isLoading: false,
  error: null,

  getSpeakers: async (eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      const speakers = await speakerService.getAll(eventId);
      set({ speakers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch speakers', isLoading: false });
      throw error;
    }
  },

  createSpeaker: async (eventId: string, data: CreateSpeakerDto) => {
    set({ isLoading: true, error: null });
    try {
      const speaker = await speakerService.create(eventId, data);
      set((state) => ({
        speakers: [...state.speakers, speaker],
        isLoading: false,
      }));
      return speaker;
    } catch (error) {
      set({ error: 'Failed to create speaker', isLoading: false });
      throw error;
    }
  },

  updateSpeaker: async (eventId: string, speakerId: string, data: UpdateSpeakerDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSpeaker = await speakerService.update(eventId, speakerId, data);
      set((state) => ({
        speakers: state.speakers.map((s) =>
          s.id === speakerId ? updatedSpeaker : s
        ),
        isLoading: false,
      }));
      return updatedSpeaker;
    } catch (error) {
      set({ error: 'Failed to update speaker', isLoading: false });
      throw error;
    }
  },

  deleteSpeaker: async (eventId: string, speakerId: string) => {
    set({ isLoading: true, error: null });
    try {
      await speakerService.delete(eventId, speakerId);
      set((state) => ({
        speakers: state.speakers.filter((s) => s.id !== speakerId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete speaker', isLoading: false });
      throw error;
    }
  },

  uploadImage: async (eventId: string, speakerId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const { imageUrl } = await speakerService.uploadImage(eventId, speakerId, file);
      set((state) => ({
        speakers: state.speakers.map((s) =>
          s.id === speakerId ? { ...s, imageUrl } : s
        ),
        isLoading: false,
      }));
      return imageUrl;
    } catch (error) {
      set({ error: 'Failed to upload image', isLoading: false });
      throw error;
    }
  },
}));
