import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'

import { fsService } from '@/features/filesystem/fsService'
import { appDb, resetDatabase } from '@/lib/db'
import { useDesktopStore } from '@/store/desktopStore'
import { useFsStore } from '@/store/fsStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useWindowStore } from '@/store/windowStore'
import { defaultDesktopSettings } from '@/types/settings'

function useDebouncedEffect(effect: () => void | Promise<void>, deps: unknown[], delay = 200) {
  useEffect(() => {
    const handle = window.setTimeout(() => {
      void effect()
    }, delay)

    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function AppProviders({ children }: PropsWithChildren) {
  const [booted, setBooted] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)

  const settings = useSettingsStore((state) => state.settings)
  const hydrateSettings = useSettingsStore((state) => state.hydrateSettings)

  const iconOrder = useDesktopStore((state) => state.iconOrder)
  const setIconOrder = useDesktopStore((state) => state.setIconOrder)

  const explorerCurrentDirectoryId = useFsStore((state) => state.currentDirectoryId)
  const explorerViewMode = useFsStore((state) => state.viewMode)
  const setCurrentDirectoryId = useFsStore((state) => state.setCurrentDirectoryId)
  const setViewMode = useFsStore((state) => state.setViewMode)

  const windows = useWindowStore((state) => state.windows)
  const hydrateWindows = useWindowStore((state) => state.hydrateWindows)
  const setMobileMode = useWindowStore((state) => state.setMobileMode)

  useEffect(() => {
    let disposed = false

    const bootstrapOnce = async () => {
        await fsService.init()

        const savedSettings = await appDb.settings.get('desktop-settings')
        hydrateSettings((savedSettings?.value as typeof defaultDesktopSettings) ?? defaultDesktopSettings)

        const desktopState = await appDb.desktopState.get('desktop')
        const desktopData = (desktopState?.value ?? {}) as {
          iconOrder?: string[]
          explorer?: {
            currentDirectoryId?: string
            viewMode?: 'list' | 'grid'
          }
        }

        if (desktopData.iconOrder && desktopData.iconOrder.length > 0) {
          setIconOrder(desktopData.iconOrder as typeof iconOrder)
        }

        if (desktopData.explorer?.currentDirectoryId) {
          setCurrentDirectoryId(desktopData.explorer.currentDirectoryId)
        }

        if (desktopData.explorer?.viewMode) {
          setViewMode(desktopData.explorer.viewMode)
        }

        const persistedWindows = await appDb.windows.toArray()
        hydrateWindows(persistedWindows)

      if (!disposed) {
        setBooted(true)
      }
    }

    const bootstrap = async () => {
      try {
        await bootstrapOnce()
      } catch {
        try {
          fsService.resetForTests()
          await resetDatabase()
          await bootstrapOnce()
        } catch (retryError) {
          setBootError(retryError instanceof Error ? retryError.message : 'Failed to bootstrap state')
        }
      }
    }

    void bootstrap()

    return () => {
      disposed = true
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const update = () => setMobileMode(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [setMobileMode])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.body.style.background = settings.wallpaper
  }, [settings])

  useDebouncedEffect(
    async () => {
      if (!booted) {
        return
      }

      await appDb.settings.put({
        key: 'desktop-settings',
        value: settings,
        updatedAt: Date.now(),
      })
    },
    [settings, booted],
    150,
  )

  useDebouncedEffect(
    async () => {
      if (!booted) {
        return
      }

      await appDb.desktopState.put({
        key: 'desktop',
        value: {
          iconOrder,
          explorer: {
            currentDirectoryId: explorerCurrentDirectoryId,
            viewMode: explorerViewMode,
          },
        },
        updatedAt: Date.now(),
      })
    },
    [iconOrder, explorerCurrentDirectoryId, explorerViewMode, booted],
    150,
  )

  useDebouncedEffect(
    async () => {
      if (!booted) {
        return
      }

      await appDb.transaction('rw', appDb.windows, async () => {
        await appDb.windows.clear()
        await appDb.windows.bulkAdd(
          windows.map((windowItem) => ({
            id: windowItem.id,
            appId: windowItem.appId,
            title: windowItem.title,
            mode: windowItem.mode,
            zIndex: windowItem.zIndex,
            position: windowItem.position,
            size: windowItem.size,
            minWidth: windowItem.minWidth,
            minHeight: windowItem.minHeight,
            restorePosition: windowItem.restorePosition,
            restoreSize: windowItem.restoreSize,
            launchParams: windowItem.launchParams,
            createdAt: windowItem.createdAt,
            updatedAt: windowItem.updatedAt,
          })),
        )
      })
    },
    [windows, booted],
    180,
  )

  if (bootError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md rounded-xl border border-red-500/60 bg-slate-900 p-6 text-sm">
          <p className="text-base font-semibold">Storage bootstrap failed</p>
          <p className="mt-2 text-slate-300">{bootError}</p>
          <button
            className="mt-4 rounded bg-red-500 px-3 py-2 text-white"
            onClick={async () => {
              await resetDatabase()
              location.reload()
            }}
            type="button"
          >
            Reset Storage and Reload
          </button>
        </div>
      </div>
    )
  }

  if (!booted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-lg border border-shell-border bg-shell-panel px-5 py-3 text-sm">Loading desktop...</div>
      </div>
    )
  }

  return children
}

export function useNotifyError(prefix: string) {
  const push = useNotificationStore((state) => state.push)

  return useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error'
      push({
        title: prefix,
        message,
        level: 'error',
      })
    },
    [prefix, push],
  )
}

export function useNotifySuccess(title: string) {
  const push = useNotificationStore((state) => state.push)

  return useCallback(
    (message?: string) => {
      push({
        title,
        message,
        level: 'success',
      })
    },
    [push, title],
  )
}
