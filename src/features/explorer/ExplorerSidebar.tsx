import type { FSNode } from '@/types/fs'

type ExplorerSidebarProps = {
  roots: FSNode[]
  currentDirectoryId: string
  onNavigate: (nodeId: string) => void
}

export function ExplorerSidebar({ roots, currentDirectoryId, onNavigate }: ExplorerSidebarProps) {
  return (
    <aside className="w-40 shrink-0 border-r border-white/10 bg-black/20 p-2">
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Locations</p>
      <div className="space-y-1">
        {roots.map((node) => (
          <button
            className={`w-full rounded px-2 py-1 text-left text-sm ${
              currentDirectoryId === node.id
                ? 'bg-shell-accent/30 text-white'
                : 'text-slate-300 hover:bg-white/10'
            }`}
            key={node.id}
            onClick={() => onNavigate(node.id)}
            type="button"
          >
            {node.name}
          </button>
        ))}
      </div>
    </aside>
  )
}
