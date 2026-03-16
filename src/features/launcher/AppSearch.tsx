import type { AppDefinition } from '@/types/app'

type AppSearchProps = {
  query: string
  onQueryChange: (value: string) => void
  apps: AppDefinition[]
  onOpenApp: (appId: AppDefinition['id']) => void
}

export function AppSearch({ query, onQueryChange, apps, onOpenApp }: AppSearchProps) {
  return (
    <div className="space-y-2">
      <input
        autoFocus
        className="w-full rounded-md border border-white/20 bg-black/25 px-3 py-2 text-sm text-slate-100 outline-none ring-shell-accent/60 placeholder:text-slate-400 focus:ring"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search apps..."
        value={query}
      />
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {apps.map((app) => (
          <button
            className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-white/10"
            data-testid={`start-app-${app.id}`}
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            type="button"
          >
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-semibold">
              {app.icon}
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-100">{app.name}</span>
              <span className="block text-xs text-slate-300">{app.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
