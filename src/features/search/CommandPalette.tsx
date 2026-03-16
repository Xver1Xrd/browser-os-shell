import { useEffect, useMemo, useState } from 'react'

import { launcherApps } from '@/app/appRegistry'
import { fsService } from '@/features/filesystem/fsService'
import { isImageMimeType, isTextMimeType } from '@/lib/mime'
import { useDesktopStore } from '@/store/desktopStore'
import type { AppId } from '@/types/app'
import type { FSNodeWithPath } from '@/types/fs'

type CommandPaletteProps = {
  onLaunchApp: (appId: AppId, options?: { nodeId?: string }) => void
}

export function CommandPalette({ onLaunchApp }: CommandPaletteProps) {
  const open = useDesktopStore((state) => state.commandPaletteOpen)
  const setOpen = useDesktopStore((state) => state.setCommandPaletteOpen)
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState<FSNodeWithPath[]>([])

  useEffect(() => {
    if (!open || !query.trim()) {
      setFiles([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      const result = await fsService.searchByName(query)
      if (!cancelled) {
        setFiles(result.slice(0, 12))
      }
    }, 120)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setFiles([])
    }
  }, [open])

  const appResults = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return launcherApps
    }

    return launcherApps.filter(
      (app) =>
        app.name.toLowerCase().includes(normalized) || app.description.toLowerCase().includes(normalized),
    )
  }, [query])

  if (!open) {
    return null
  }

  return (
    <div className="absolute inset-0 z-[1100] flex items-start justify-center bg-black/45 p-4 pt-16">
      <div className="w-[min(44rem,100%)] rounded-xl border border-white/20 bg-shell-panel/95 p-3 shadow-window backdrop-blur">
        <input
          autoFocus
          className="w-full rounded-md border border-white/20 bg-black/25 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-shell-accent focus:outline-none"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder="Search apps and files"
          value={query}
        />

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Apps</p>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {appResults.map((app) => (
                <button
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-white/10"
                  key={app.id}
                  onClick={() => {
                    onLaunchApp(app.id)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded border border-white/20 bg-white/10 text-xs font-semibold">
                    {app.icon}
                  </span>
                  <span className="text-sm text-slate-100">{app.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Files</p>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {files.map((file) => (
                <button
                  className="w-full rounded px-2 py-2 text-left hover:bg-white/10"
                  key={file.id}
                  onClick={() => {
                    if (file.kind === 'directory') {
                      onLaunchApp('explorer', { nodeId: file.id })
                    } else if (isImageMimeType(file.mimeType)) {
                      onLaunchApp('images', { nodeId: file.id })
                    } else if (isTextMimeType(file.mimeType)) {
                      onLaunchApp('editor', { nodeId: file.id })
                    } else {
                      onLaunchApp('explorer', { nodeId: file.id })
                    }
                    setOpen(false)
                  }}
                  type="button"
                >
                  <p className="truncate text-sm text-slate-100">{file.name}</p>
                  <p className="truncate text-xs text-slate-400">{file.path}</p>
                </button>
              ))}
              {files.length === 0 ? (
                <p className="rounded border border-dashed border-white/15 px-2 py-4 text-center text-xs text-slate-400">
                  No files found.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
