import { Clock } from './Clock'

type SystemTrayProps = {
  notificationCount: number
  onOpenNotifications: () => void
}

export function SystemTray({ notificationCount, onOpenNotifications }: SystemTrayProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="relative rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs text-slate-100 hover:bg-white/20"
        onClick={onOpenNotifications}
        type="button"
      >
        Alerts
        {notificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none text-white">
            {notificationCount}
          </span>
        ) : null}
      </button>
      <div className="rounded-md border border-white/20 bg-white/10 px-3 py-2">
        <Clock />
      </div>
    </div>
  )
}
