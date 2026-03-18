import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSettingsStore = create(
  persist(
    (set) => ({
      // State
      voiceEnabled: true,
      volume: 0.85,
      darkMode: false,
      
      // Actions
      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
      setVolume: (vol) => set({ volume: vol }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
