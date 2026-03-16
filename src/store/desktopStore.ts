import { create } from 'zustand'

import type { AppId } from '@/types/app'

type DesktopStore = {
  startMenuOpen: boolean
  commandPaletteOpen: boolean
  iconOrder: AppId[]
  setStartMenuOpen: (open: boolean) => void
  toggleStartMenu: () => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void
  setIconOrder: (apps: AppId[]) => void
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  startMenuOpen: false,
  commandPaletteOpen: false,
  iconOrder: ['explorer', 'editor', 'images', 'terminal', 'settings', 'about'],
  setStartMenuOpen: (open) => set({ startMenuOpen: open }),
  toggleStartMenu: () => set((state) => ({ startMenuOpen: !state.startMenuOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () =>
    set((state) => ({
      commandPaletteOpen: !state.commandPaletteOpen,
      startMenuOpen: false,
    })),
  setIconOrder: (apps) => set({ iconOrder: apps }),
}))
