import { appRegistry } from '@/app/appRegistry'
import { useWindowStore } from '@/store/windowStore'

export function RunningApps() {
  const windows = useWindowStore((state) => state.windows)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const toggleMinimizeWindow = useWindowStore((state) => state.toggleMinimizeWindow)

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
      {windows.map((windowItem) => {
        const app = appRegistry[windowItem.appId]
        return (
          <button
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition ${
              windowItem.focused && windowItem.mode !== 'minimized'
                ? 'border-shell-accent bg-shell-accent/25 text-white'
                : 'border-white/15 bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
            key={windowItem.id}
            onClick={() => {
              if (windowItem.focused && windowItem.mode !== 'minimized') {
                toggleMinimizeWindow(windowItem.id)
              } else {
                focusWindow(windowItem.id)
                if (windowItem.mode === 'minimized') {
                  toggleMinimizeWindow(windowItem.id)
                }
              }
            }}
            type="button"
          >
            <span className="font-semibold">{app.icon}</span>
            <span className="max-w-32 truncate">{windowItem.title}</span>
          </button>
        )
      })}
    </div>
  )
}
