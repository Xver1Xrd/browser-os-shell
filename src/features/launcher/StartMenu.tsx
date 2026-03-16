import { useMemo, useState } from 'react'

import { launcherApps } from '@/app/appRegistry'
import { useDesktopStore } from '@/store/desktopStore'
import { useAppStore } from '@/store/appStore'
import type { AppId } from '@/types/app'

import { AppSearch } from './AppSearch'

type StartMenuProps = {
  onLaunch: (appId: AppId) => void
}

export function StartMenu({ onLaunch }: StartMenuProps) {
  const startMenuOpen = useDesktopStore((state) => state.startMenuOpen)
  const setStartMenuOpen = useDesktopStore((state) => state.setStartMenuOpen)
  const markAppUsed = useAppStore((state) => state.markAppUsed)
  const recentlyUsed = useAppStore((state) => state.recentlyUsed)

  const [query, setQuery] = useState('')

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      const order = new Map(recentlyUsed.map((id, index) => [id, index]))
      return [...launcherApps].sort((left, right) => {
        const leftIndex = order.get(left.id) ?? Number.MAX_SAFE_INTEGER
        const rightIndex = order.get(right.id) ?? Number.MAX_SAFE_INTEGER
        return leftIndex - rightIndex
      })
    }

    return launcherApps.filter(
      (app) =>
        app.name.toLowerCase().includes(normalized) ||
        app.description.toLowerCase().includes(normalized),
    )
  }, [query, recentlyUsed])

  if (!startMenuOpen) {
    return null
  }

  return (
    <div
      className="absolute bottom-16 left-3 z-[1001] w-[min(90vw,28rem)] rounded-xl border border-white/20 bg-shell-panel/95 p-3 shadow-window backdrop-blur"
      data-testid="start-menu"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-100">Applications</p>
        <button
          className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
          onClick={() => setStartMenuOpen(false)}
          type="button"
        >
          Close
        </button>
      </div>

      <AppSearch
        apps={filteredApps}
        onOpenApp={(appId) => {
          onLaunch(appId)
          markAppUsed(appId)
          setStartMenuOpen(false)
          setQuery('')
        }}
        onQueryChange={setQuery}
        query={query}
      />
    </div>
  )
}
