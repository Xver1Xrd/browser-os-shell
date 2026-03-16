import { useDesktopStore } from '@/store/desktopStore'
import { useNotificationStore } from '@/store/notificationStore'

import { RunningApps } from './RunningApps'
import { SystemTray } from './SystemTray'

type TaskbarProps = {
  onOpenNotifications: () => void
}

export function Taskbar({ onOpenNotifications }: TaskbarProps) {
  const toggleStartMenu = useDesktopStore((state) => state.toggleStartMenu)
  const toggleCommandPalette = useDesktopStore((state) => state.toggleCommandPalette)
  const notifications = useNotificationStore((state) => state.notifications)

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-[999] border-t border-white/15 bg-shell-panel/95 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border border-white/20 bg-white/15 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/25"
          onClick={toggleStartMenu}
          type="button"
        >
          Start
        </button>
        <button
          className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs text-slate-100 hover:bg-white/20"
          onClick={toggleCommandPalette}
          type="button"
        >
          Search
        </button>

        <RunningApps />

        <SystemTray
          notificationCount={notifications.length}
          onOpenNotifications={onOpenNotifications}
        />
      </div>
    </footer>
  )
}
