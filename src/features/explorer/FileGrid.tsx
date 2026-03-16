import { useLongPress } from '@/hooks/useLongPress'
import type { FSNode } from '@/types/fs'

type FileGridProps = {
  nodes: FSNode[]
  selectedNodeId: string | null
  onSelect: (nodeId: string) => void
  onOpen: (node: FSNode) => void
}

type FileTileProps = {
  node: FSNode
  selected: boolean
  onSelect: (nodeId: string) => void
  onOpen: (node: FSNode) => void
}

function FileTile({ node, selected, onSelect, onOpen }: FileTileProps) {
  const longPressBindings = useLongPress({
    onLongPress: () => onSelect(node.id),
    onClick: () => onSelect(node.id),
  })

  return (
    <button
      className={`rounded-lg border p-2 text-left ${
        selected
          ? 'border-shell-accent bg-shell-accent/25 text-white'
          : 'border-white/15 bg-black/20 text-slate-200 hover:bg-white/10'
      }`}
      onDoubleClick={() => onOpen(node)}
      onContextMenu={(event) => {
        event.preventDefault()
        onSelect(node.id)
      }}
      type="button"
      {...longPressBindings}
    >
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-xs font-semibold">
        {node.kind === 'directory' ? 'DIR' : 'FILE'}
      </div>
      <p className="line-clamp-2 text-xs">{node.name}</p>
    </button>
  )
}

export function FileGrid({ nodes, selectedNodeId, onSelect, onOpen }: FileGridProps) {
  return (
    <div className="h-full overflow-auto p-2">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
        {nodes.map((node) => (
          <FileTile
            key={node.id}
            node={node}
            onOpen={onOpen}
            onSelect={onSelect}
            selected={node.id === selectedNodeId}
          />
        ))}
      </div>

      <div className="mt-2 rounded-md border border-white/20 bg-black/30 px-2 py-1 text-[11px] text-slate-400">
        Long press or right click for selection actions
      </div>
    </div>
  )
}
