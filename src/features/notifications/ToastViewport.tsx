import { useEffect } from 'react'

import { useNotificationStore } from '@/store/notificationStore'

const LEVEL_CLASS: Record<string, string> = {
  info: 'border-blue-400/50',
  success: 'border-emerald-400/50',
  warning: 'border-amber-400/50',
  error: 'border-red-400/60',
}

export function ToastViewport() {
  const toasts = useNotificationStore((state) => state.toasts)
  const dismissToast = useNotificationStore((state) => state.dismissToast)

  useEffect(() => {
    if (toasts.length === 0) {
      return
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id)
      }, 4200),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [dismissToast, toasts])

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[1200] flex w-[min(28rem,92vw)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          className={`pointer-events-auto rounded-lg border bg-shell-panel/95 p-3 text-sm text-slate-100 shadow-window ${LEVEL_CLASS[toast.level] ?? LEVEL_CLASS.info}`}
          key={toast.id}
        >
          <p className="font-semibold">{toast.title}</p>
          {toast.message ? <p className="mt-1 text-xs text-slate-300">{toast.message}</p> : null}
        </div>
      ))}
    </div>
  )
}
