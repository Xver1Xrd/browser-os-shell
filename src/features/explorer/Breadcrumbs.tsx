export type BreadcrumbItem = {
  id: string
  name: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  onNavigate: (nodeId: string) => void
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav aria-label="Path" className="flex min-w-0 items-center gap-1 overflow-x-auto rounded border border-white/15 bg-black/20 px-2 py-1 text-xs">
      {items.map((item, index) => (
        <span className="flex items-center gap-1" key={item.id}>
          <button
            className="max-w-36 truncate rounded px-1 py-0.5 text-slate-200 hover:bg-white/10"
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            {item.name}
          </button>
          {index < items.length - 1 ? <span className="text-slate-500">/</span> : null}
        </span>
      ))}
    </nav>
  )
}
