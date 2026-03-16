import { useLongPress } from '@/hooks/useLongPress'
import type { FSNode } from '@/types/fs'

type FileListProps = {
  nodes: FSNode[]
  selectedNodeId: string | null
  onSelect: (nodeId: string) => void
  onOpen: (node: FSNode) => void
}

type FileListRowProps = {
  node: FSNode
  selected: boolean
  onSelect: (nodeId: string) => void
  onOpen: (node: FSNode) => void
}

function FileListRow({ node, selected, onSelect, onOpen }: FileListRowProps) {
  const longPressBindings = useLongPress({
    onLongPress: () => onSelect(node.id),
    onClick: () => onSelect(node.id),
  })

  return (
    <tr
      className={`cursor-pointer border-b border-white/5 ${selected ? 'bg-shell-accent/25' : 'hover:bg-white/10'}`}
      onDoubleClick={() => onOpen(node)}
      onContextMenu={(event) => {
        event.preventDefault()
        onSelect(node.id)
      }}
      {...longPressBindings}
    >
      <td className="truncate px-2 py-2 text-slate-100">{node.name}</td>
      <td className="px-2 py-2 text-slate-300">{node.kind === 'directory' ? 'Folder' : node.mimeType ?? 'File'}</td>
      <td className="px-2 py-2 text-right text-slate-300">{node.kind === 'file' ? `${Math.ceil(node.size / 1024)} KB` : '-'}</td>
    </tr>
  )
}

export function FileList({ nodes, selectedNodeId, onSelect, onOpen }: FileListProps) {
  return (
    <div className="h-full overflow-auto">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Type</th>
            <th className="px-2 py-2 text-right">Size</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <FileListRow
              key={node.id}
              node={node}
              onOpen={onOpen}
              onSelect={onSelect}
              selected={node.id === selectedNodeId}
            />
          ))}
        </tbody>
      </table>

      <div className="pointer-events-none sticky bottom-3 left-3 mt-3 inline-flex rounded-md border border-white/20 bg-shell-panel/95 px-3 py-2 text-xs text-slate-200 shadow-window">
        Long press or right click for selection actions
      </div>
    </div>
  )
}
