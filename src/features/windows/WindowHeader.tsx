import type { DesktopWindow } from '@/types/window'

type WindowHeaderProps = {
  windowItem: DesktopWindow
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onMinimize: () => void
  onMaximize: () => void
  onRestore: () => void
  onClose: () => void
}

export function WindowHeader({
  windowItem,
  onPointerDown,
  onMinimize,
  onMaximize,
  onRestore,
  onClose,
}: WindowHeaderProps) {
  const canRestore = windowItem.mode === 'maximized'

  return (
    <header
      className="flex h-11 items-center justify-between border-b border-white/10 bg-black/30 px-3"
      onDoubleClick={canRestore ? onRestore : onMaximize}
      onPointerDown={onPointerDown}
      role="presentation"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="truncate text-sm font-medium text-slate-100">{windowItem.title}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="rounded px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
          onClick={(event) => {
            event.stopPropagation()
            onMinimize()
          }}
          type="button"
        >
          Min
        </button>
        <button
          className="rounded px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
          onClick={(event) => {
            event.stopPropagation()
            if (canRestore) {
              onRestore()
            } else {
              onMaximize()
            }
          }}
          type="button"
        >
          {canRestore ? 'Restore' : 'Max'}
        </button>
        <button
          className="rounded bg-red-500/85 px-2 py-1 text-xs text-white hover:bg-red-500"
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          type="button"
        >
          Close
        </button>
      </div>
    </header>
  )
}
