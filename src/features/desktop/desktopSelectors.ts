import { useDesktopStore } from '@/store/desktopStore'

type DesktopState = ReturnType<typeof useDesktopStore.getState>

export const desktopSelectors = {
  startMenuOpen: (state: DesktopState) => state.startMenuOpen,
  commandPaletteOpen: (state: DesktopState) => state.commandPaletteOpen,
  iconOrder: (state: DesktopState) => state.iconOrder,
}
