import { useMemo, useState } from 'react'

import { appRegistry } from '@/app/appRegistry'
import { detectCapabilities } from '@/lib/capability'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAppStore } from '@/store/appStore'
import { useDesktopStore } from '@/store/desktopStore'
import { useWindowStore } from '@/store/windowStore'
import type { AppId } from '@/types/app'

import { Desktop } from '@/features/desktop/Desktop'
import { StartMenu } from '@/features/launcher/StartMenu'
import { NotificationCenter } from '@/features/notifications/NotificationCenter'
import { ToastViewport } from '@/features/notifications/ToastViewport'
import { CommandPalette } from '@/features/search/CommandPalette'
import { Taskbar } from '@/features/taskbar/Taskbar'
import { WindowHost } from '@/features/windows/WindowHost'

export default function App() {
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)

  const openWindow = useWindowStore((state) => state.openWindow)
  const setStartMenuOpen = useDesktopStore((state) => state.setStartMenuOpen)
  const setCommandPaletteOpen = useDesktopStore((state) => state.setCommandPaletteOpen)
  const markAppUsed = useAppStore((state) => state.markAppUsed)

  const capabilities = useMemo(() => detectCapabilities(), [])

  const launchApp = (appId: AppId, options?: { nodeId?: string }) => {
    const app = appRegistry[appId]
    openWindow(appId, {
      title: app.name,
      launchParams: options?.nodeId
        ? {
            nodeId: options.nodeId,
          }
        : undefined,
    })
    markAppUsed(appId)
  }

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlOrMeta: true,
      callback: () => {
        setCommandPaletteOpen(true)
        setStartMenuOpen(false)
      },
    },
    {
      key: 'escape',
      callback: () => {
        setStartMenuOpen(false)
        setCommandPaletteOpen(false)
        setNotificationCenterOpen(false)
      },
    },
  ])

  return (
    <div className="relative h-screen w-screen overflow-hidden text-slate-100">
      <Desktop
        onBackgroundClick={() => {
          setStartMenuOpen(false)
        }}
        onLaunch={launchApp}
      />

      <WindowHost />
      <StartMenu onLaunch={launchApp} />

      <CommandPalette onLaunchApp={launchApp} />

      <NotificationCenter
        onClose={() => setNotificationCenterOpen(false)}
        open={notificationCenterOpen}
      />

      <ToastViewport />

      <Taskbar onOpenNotifications={() => setNotificationCenterOpen((value) => !value)} />

      {capabilities.isTouchDevice ? (
        <div className="pointer-events-none absolute bottom-16 left-3 rounded-md bg-black/40 px-2 py-1 text-[10px] text-slate-300">
          Long press on icons/files for context actions
        </div>
      ) : null}
    </div>
  )
}
