import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;

  // Typography
  primaryFont: string;
  monospaceFont: string;
  baseFontSize: number;
  headingWeight: string;
  bodyWeight: string;

  // Layout
  borderRadius: number;
  containerWidth: string;
  enableGlassmorphism: boolean;
  enableTransitions: boolean;

  // Actions
  updateTheme: (updates: Partial<ThemeState>) => void;
  resetTheme: () => void;
}

const defaultTheme = {
  primaryColor: '#7C3AED',
  secondaryColor: '#5B21B6',
  accentColor: '#4C1D95',
  backgroundColor: '#FFFFFF',
  foregroundColor: '#000000',
  borderColor: '#E5E7EB',
  primaryFont: 'geist',
  monospaceFont: 'geist-mono',
  baseFontSize: 16,
  headingWeight: '600',
  bodyWeight: '400',
  borderRadius: 8,
  containerWidth: '1400',
  enableGlassmorphism: false,
  enableTransitions: true,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      ...defaultTheme,

      updateTheme: updates => set(state => ({ ...state, ...updates })),

      resetTheme: () => set(defaultTheme),
    }),
    {
      name: 'theme-storage',
    }
  )
);
