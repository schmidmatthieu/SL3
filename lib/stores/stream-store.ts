"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerSettings {
  theme: string;
  playbackRates: number[];
  fluid: boolean;
  responsive: boolean;
}

interface StreamConfig {
  type: 'live' | 'vod';
  url: string;
  vodSource?: 'youtube' | 'vimeo' | 'custom';
  autoplay?: boolean;
  quality?: string;
  playerSettings: PlayerSettings;
}

interface StreamState {
  config: StreamConfig | null;
  updateConfig: (config: StreamConfig) => void;
  resetConfig: () => void;
}

const defaultConfig: StreamConfig = {
  type: 'live',
  url: '',
  autoplay: true,
  quality: 'auto',
  playerSettings: {
    theme: 'city',
    playbackRates: [0.5, 1, 1.5, 2],
    fluid: true,
    responsive: true,
  },
};

export const useStreamStore = create<StreamState>()(
  persist(
    (set) => ({
      config: null,
      updateConfig: (config) => set({ config }),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'stream-config',
      version: 1,
    }
  )
);