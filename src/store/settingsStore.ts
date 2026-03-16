import { create } from 'zustand'

import { defaultDesktopSettings, type DesktopSettings, type ThemeMode } from '@/types/settings'

type SettingsStore = {
  settings: DesktopSettings
  hydrated: boolean
  hydrateSettings: (settings: DesktopSettings) => void
  setTheme: (theme: ThemeMode) => void
  setWallpaper: (wallpaper: string) => void
  setIconSize: (size: DesktopSettings['iconSize']) => void
  setAnimations: (enabled: boolean) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultDesktopSettings,
  hydrated: false,
  hydrateSettings: (settings) => set({ settings, hydrated: true }),
  setTheme: (theme) => set((state) => ({ settings: { ...state.settings, theme } })),
  setWallpaper: (wallpaper) => set((state) => ({ settings: { ...state.settings, wallpaper } })),
  setIconSize: (iconSize) => set((state) => ({ settings: { ...state.settings, iconSize } })),
  setAnimations: (animations) => set((state) => ({ settings: { ...state.settings, animations } })),
  resetSettings: () => set({ settings: defaultDesktopSettings }),
}))
