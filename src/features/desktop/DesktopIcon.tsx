import { useState } from 'react'

import { useLongPress } from '@/hooks/useLongPress'
import { useSettingsStore } from '@/store/settingsStore'
import type { AppDefinition, AppId } from '@/types/app'

type DesktopIconProps = {
  app: AppDefinition
  onLaunch: (appId: AppId) => void
}

const ICON_SIZE_MAP = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
}

export function DesktopIcon({ app, onLaunch }: DesktopIconProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const iconSize = useSettingsStore((state) => state.settings.iconSize)

  const openApp = () => {
    setMenuOpen(false)
    onLaunch(app.id)
  }

  const longPressBindings = useLongPress({
    onLongPress: () => setMenuOpen(true),
    onClick: undefined,
  })

  return (
    <div className="relative">
      <button
        className="group flex w-20 flex-col items-center gap-2 rounded-lg p-2 text-left text-slate-100 transition hover:bg-white/10 active:scale-[0.98]"
        onDoubleClick={openApp}
        onContextMenu={(event) => {
          event.preventDefault()
          setMenuOpen(true)
        }}
        type="button"
        {...longPressBindings}
      >
        <div
          className={`flex ${ICON_SIZE_MAP[iconSize]} items-center justify-center rounded-xl border border-white/20 bg-white/10 font-semibold backdrop-blur`}
        >
          {app.icon}
        </div>
        <span className="line-clamp-2 text-center text-xs leading-tight text-slate-100/95">{app.name}</span>
      </button>

      {menuOpen ? (
        <div className="absolute left-full top-2 z-50 w-44 rounded-lg border border-shell-border bg-shell-panel/95 p-1 text-sm shadow-window backdrop-blur">
          <button
            className="w-full rounded px-3 py-2 text-left hover:bg-white/10"
            onClick={openApp}
            type="button"
          >
            Open
          </button>
          <button
            className="w-full rounded px-3 py-2 text-left hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            Close menu
          </button>
        </div>
      ) : null}
    </div>
  )
}
