import { MediaUsageType } from '@/apps/api/src/modules/media/types/media.types';
import { Media, mediaService, MediaUsage } from '@/lib/api/media';
import { validateMediaFile } from '@/lib/validations/media/media-validators';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MediaStore {
  items: Media[];
  selectedType: MediaUsageType | null;
  isLoading: boolean;
  error: string | null;

  // Actions de base
  fetchAll: (type?: MediaUsageType) => Promise<void>;
  uploadMedia: (file: File) => Promise<string>;
  uploadFromUrl: (url: string) => Promise<string>;
  deleteMedia: (id: string) => Promise<void>;
  updateMetadata: (id: string, metadata: Media['metadata']) => Promise<void>;

  // Actions de filtrage
  setSelectedType: (type: MediaUsageType | null) => void;

  // Actions d'utilisation
  addUsage: (mediaId: string, usage: Omit<MediaUsage, 'usedAt'>) => Promise<void>;
  removeUsage: (mediaId: string, entityId: string) => Promise<void>;
  updateUsageEntityName: (
    type: MediaUsage['type'],
    entityId: string,
    entityName: string
  ) => Promise<void>;
}

export const useMediaStore = create<MediaStore>()(
  devtools(
    (set, get) => ({
      items: [],
      selectedType: null,
      isLoading: false,
      error: null,

      setSelectedType: type => {
        set({ selectedType: type });
        get().fetchAll(type);
      },

      fetchAll: async type => {
        set({ isLoading: true, error: null });
        try {
          const items = await mediaService.getAll(type);
          set({ items, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      uploadMedia: async (file: File) => {
        set({ isLoading: true, error: null });
        try {
          validateMediaFile(file);
          const media = await mediaService.uploadImage(file);
          set(state => ({
            items: [media, ...state.items],
            isLoading: false,
          }));
          return media.url;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      uploadFromUrl: async (url: string) => {
        set({ isLoading: true, error: null });
        try {
          const media = await mediaService.uploadFromUrl(url);
          set(state => ({
            items: [media, ...state.items],
            isLoading: false,
          }));
          return media.url;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteMedia: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await mediaService.delete(id);
          set(state => ({
            items: state.items.filter(item => item._id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateMetadata: async (id: string, metadata: Media['metadata']) => {
        set({ isLoading: true, error: null });
        try {
          const updatedMedia = await mediaService.updateMetadata(id, metadata);
          set(state => ({
            items: state.items.map(item =>
              item._id === id ? { ...item, metadata: updatedMedia.metadata } : item
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      addUsage: async (mediaId: string, usage: Omit<MediaUsage, 'usedAt'>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedMedia = await mediaService.addUsage(mediaId, usage);
          set(state => ({
            items: state.items.map(item => (item._id === mediaId ? updatedMedia : item)),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      removeUsage: async (mediaId: string, entityId: string) => {
        set({ isLoading: true, error: null });
        try {
          const updatedMedia = await mediaService.removeUsage(mediaId, entityId);
          set(state => ({
            items: state.items.map(item => (item._id === mediaId ? updatedMedia : item)),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateUsageEntityName: async (
        type: MediaUsage['type'],
        entityId: string,
        entityName: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          await mediaService.updateUsageEntityName(type, entityId, entityName);
          // Mettre à jour tous les médias qui utilisent cette entité
          set(state => ({
            items: state.items.map(item => ({
              ...item,
              usages: item.usages?.map(usage =>
                usage.type === type && usage.entityId === entityId
                  ? { ...usage, entityName }
                  : usage
              ),
            })),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'media-store',
    }
  )
);
