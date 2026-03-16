import { create } from 'zustand'

import { appRegistry } from '@/app/appRegistry'
import { createId } from '@/lib/id'
import type { AppId, AppLaunchParams } from '@/types/app'
import type { DesktopWindow, PersistedWindowState, WindowPosition, WindowSize } from '@/types/window'

type OpenWindowOptions = {
  title?: string
  launchParams?: AppLaunchParams
}

type WindowStore = {
  windows: DesktopWindow[]
  topZ: number
  isMobileMode: boolean
  setMobileMode: (mobile: boolean) => void
  hydrateWindows: (windows: PersistedWindowState[]) => void
  openWindow: (appId: AppId, options?: OpenWindowOptions) => string
  closeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  toggleMinimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
  moveWindow: (windowId: string, position: WindowPosition) => void
  resizeWindow: (windowId: string, size: WindowSize, position?: WindowPosition) => void
  updateWindowTitle: (windowId: string, title: string) => void
  clearWindows: () => void
}

const DESKTOP_TASKBAR_HEIGHT = 56
const WINDOW_GAP = 12

function getViewportSize() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280
  const height = typeof window !== 'undefined' ? window.innerHeight : 720
  return {
    width,
    height,
  }
}

function clampPosition(position: WindowPosition, size: WindowSize): WindowPosition {
  const viewport = getViewportSize()
  const maxX = Math.max(WINDOW_GAP, viewport.width - size.width - WINDOW_GAP)
  const maxY = Math.max(WINDOW_GAP, viewport.height - DESKTOP_TASKBAR_HEIGHT - size.height)

  return {
    x: Math.min(Math.max(position.x, WINDOW_GAP), maxX),
    y: Math.min(Math.max(position.y, WINDOW_GAP), maxY),
  }
}

function getDefaultWindowPosition(index: number, size: WindowSize, isMobile: boolean): WindowPosition {
  if (isMobile) {
    return { x: 0, y: 0 }
  }

  const viewport = getViewportSize()
  const baseX = Math.max(WINDOW_GAP, Math.round((viewport.width - size.width) / 2))
  const baseY = Math.max(WINDOW_GAP, Math.round((viewport.height - DESKTOP_TASKBAR_HEIGHT - size.height) / 2))

  return clampPosition(
    {
      x: baseX + index * 26,
      y: baseY + index * 22,
    },
    size,
  )
}

function getMobileSize(): WindowSize {
  const viewport = getViewportSize()
  return {
    width: viewport.width,
    height: viewport.height - DESKTOP_TASKBAR_HEIGHT,
  }
}

function getMaximizedBounds(minWidth: number, minHeight: number): { size: WindowSize; position: WindowPosition } {
  const viewport = getViewportSize()
  return {
    size: {
      width: Math.max(minWidth, viewport.width - WINDOW_GAP * 2),
      height: Math.max(minHeight, viewport.height - DESKTOP_TASKBAR_HEIGHT - WINDOW_GAP * 2),
    },
    position: {
      x: WINDOW_GAP,
      y: WINDOW_GAP,
    },
  }
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  topZ: 10,
  isMobileMode: false,
  setMobileMode: (mobile) => {
    set((state) => {
      if (state.isMobileMode === mobile) {
        return state
      }

      const nextWindows = state.windows.map((win) => {
        if (!mobile) {
          if (win.mode === 'maximized' && win.restoreSize && win.restorePosition) {
            return {
              ...win,
              mode: 'normal' as const,
              size: win.restoreSize,
              position: win.restorePosition,
              restoreSize: undefined,
              restorePosition: undefined,
            }
          }

          return win
        }

        return {
          ...win,
          mode: 'maximized' as const,
          restorePosition: win.restorePosition ?? win.position,
          restoreSize: win.restoreSize ?? win.size,
          position: { x: 0, y: 0 },
          size: getMobileSize(),
        }
      })

      return {
        ...state,
        isMobileMode: mobile,
        windows: nextWindows,
      }
    })
  },
  hydrateWindows: (windows) => {
    set((state) => {
      const sorted = [...windows].sort((left, right) => left.zIndex - right.zIndex)
      const topZ = sorted.length ? Math.max(...sorted.map((win) => win.zIndex)) : state.topZ

      return {
        ...state,
        windows: sorted.map((win, index) => ({
          ...win,
          focused: index === sorted.length - 1,
        })),
        topZ,
      }
    })
  },
  openWindow: (appId, options) => {
    const state = get()
    const definition = appRegistry[appId]

    if (definition.singleton) {
      const existing = state.windows.find((windowItem) => windowItem.appId === appId)
      if (existing) {
        state.focusWindow(existing.id)
        state.restoreWindow(existing.id)
        return existing.id
      }
    }

    const createdAt = Date.now()
    const id = createId('window')
    const size = state.isMobileMode
      ? getMobileSize()
      : {
          width: definition.defaultWidth,
          height: definition.defaultHeight,
        }

    const position = state.isMobileMode
      ? { x: 0, y: 0 }
      : getDefaultWindowPosition(state.windows.length, size, state.isMobileMode)

    const nextZ = state.topZ + 1

    const windowItem: DesktopWindow = {
      id,
      appId,
      title: options?.title ?? definition.name,
      mode: state.isMobileMode ? 'maximized' : 'normal',
      focused: true,
      zIndex: nextZ,
      position,
      size,
      minWidth: definition.minWidth,
      minHeight: definition.minHeight,
      launchParams: options?.launchParams,
      createdAt,
      updatedAt: createdAt,
    }

    set((current) => ({
      ...current,
      topZ: nextZ,
      windows: [
        ...current.windows.map((candidate) => ({
          ...candidate,
          focused: false,
        })),
        windowItem,
      ],
    }))

    return id
  },
  closeWindow: (windowId) => {
    set((state) => {
      const next = state.windows.filter((windowItem) => windowItem.id !== windowId)
      if (next.length === 0) {
        return {
          ...state,
          windows: [],
        }
      }

      const topWindow = [...next].sort((left, right) => right.zIndex - left.zIndex)[0]

      return {
        ...state,
        windows: next.map((windowItem) => ({
          ...windowItem,
          focused: windowItem.id === topWindow.id,
        })),
      }
    })
  },
  focusWindow: (windowId) => {
    set((state) => {
      const found = state.windows.find((windowItem) => windowItem.id === windowId)
      if (!found) {
        return state
      }

      const nextZ = state.topZ + 1
      return {
        ...state,
        topZ: nextZ,
        windows: state.windows.map((windowItem) => {
          if (windowItem.id === windowId) {
            return {
              ...windowItem,
              focused: true,
              zIndex: nextZ,
              updatedAt: Date.now(),
            }
          }

          return {
            ...windowItem,
            focused: false,
          }
        }),
      }
    })
  },
  minimizeWindow: (windowId) => {
    set((state) => ({
      ...state,
      windows: state.windows.map((windowItem) => {
        if (windowItem.id !== windowId) {
          return windowItem
        }

        return {
          ...windowItem,
          mode: 'minimized',
          focused: false,
          updatedAt: Date.now(),
        }
      }),
    }))

    const windows = get().windows.filter((windowItem) => windowItem.mode !== 'minimized')
    const nextFocused = [...windows].sort((left, right) => right.zIndex - left.zIndex)[0]
    if (nextFocused) {
      get().focusWindow(nextFocused.id)
    }
  },
  toggleMinimizeWindow: (windowId) => {
    const state = get()
    const target = state.windows.find((windowItem) => windowItem.id === windowId)
    if (!target) {
      return
    }

    if (target.mode === 'minimized') {
      state.restoreWindow(windowId)
      state.focusWindow(windowId)
      return
    }

    state.minimizeWindow(windowId)
  },
  maximizeWindow: (windowId) => {
    set((state) => ({
      ...state,
      windows: state.windows.map((windowItem) => {
        if (windowItem.id !== windowId || windowItem.mode === 'maximized') {
          return windowItem
        }

        const bounds = getMaximizedBounds(windowItem.minWidth, windowItem.minHeight)
        return {
          ...windowItem,
          mode: 'maximized',
          restorePosition: windowItem.position,
          restoreSize: windowItem.size,
          position: bounds.position,
          size: state.isMobileMode ? getMobileSize() : bounds.size,
          updatedAt: Date.now(),
        }
      }),
    }))
  },
  restoreWindow: (windowId) => {
    set((state) => ({
      ...state,
      windows: state.windows.map((windowItem) => {
        if (windowItem.id !== windowId) {
          return windowItem
        }

        if (windowItem.mode === 'normal') {
          return windowItem
        }

        if (windowItem.mode === 'minimized') {
          return {
            ...windowItem,
            mode: 'normal',
            updatedAt: Date.now(),
          }
        }

        return {
          ...windowItem,
          mode: 'normal',
          position: windowItem.restorePosition ?? windowItem.position,
          size: windowItem.restoreSize ?? windowItem.size,
          restorePosition: undefined,
          restoreSize: undefined,
          updatedAt: Date.now(),
        }
      }),
    }))
  },
  moveWindow: (windowId, position) => {
    set((state) => ({
      ...state,
      windows: state.windows.map((windowItem) => {
        if (windowItem.id !== windowId || windowItem.mode !== 'normal' || state.isMobileMode) {
          return windowItem
        }

        return {
          ...windowItem,
          position: clampPosition(position, windowItem.size),
          updatedAt: Date.now(),
        }
      }),
    }))
  },
  resizeWindow: (windowId, size, position) => {
    set((state) => ({
      ...state,
      windows: state.windows.map((windowItem) => {
        if (windowItem.id !== windowId || windowItem.mode !== 'normal' || state.isMobileMode) {
          return windowItem
        }

        const nextSize = {
          width: Math.max(windowItem.minWidth, size.width),
          height: Math.max(windowItem.minHeight, size.height),
        }

        const nextPosition = position ? clampPosition(position, nextSize) : windowItem.position

        return {
          ...windowItem,
          size: nextSize,
          position: nextPosition,
          updatedAt: Date.now(),
        }
      }),
    }))
  },
  updateWindowTitle: (windowId, title) => {
    set((state) => ({
      ...state,
      windows: state.windows.map((windowItem) =>
        windowItem.id === windowId
          ? {
              ...windowItem,
              title,
            }
          : windowItem,
      ),
    }))
  },
  clearWindows: () => set({ windows: [] }),
}))
