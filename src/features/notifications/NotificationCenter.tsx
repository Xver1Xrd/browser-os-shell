import { formatDateTime } from '@/lib/time'
import { useNotificationStore } from '@/store/notificationStore'

type NotificationCenterProps = {
  open: boolean
  onClose: () => void
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const notifications = useNotificationStore((state) => state.notifications)
  const dismiss = useNotificationStore((state) => state.dismiss)
  const clearAll = useNotificationStore((state) => state.clearAll)

  if (!open) {
    return null
  }

  return (
    <aside className="absolute bottom-16 right-3 z-[1001] w-[min(26rem,94vw)] rounded-xl border border-white/20 bg-shell-panel/95 p-3 shadow-window backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            onClick={clearAll}
            type="button"
          >
            Clear
          </button>
          <button
            className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-md border border-dashed border-white/15 p-3 text-sm text-slate-300">No notifications yet.</p>
      ) : (
        <ul className="max-h-96 space-y-2 overflow-y-auto">
          {notifications.map((notification) => (
            <li
              className="rounded-md border border-white/15 bg-black/20 p-2 text-sm text-slate-200"
              key={notification.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-100">{notification.title}</p>
                  {notification.message ? (
                    <p className="mt-1 text-xs text-slate-300">{notification.message}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(notification.createdAt)}</p>
                </div>
                <button
                  className="rounded px-2 py-1 text-xs hover:bg-white/10"
                  onClick={() => dismiss(notification.id)}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
