import type { FSNode } from '@/types/fs'

type ExplorerToolbarProps = {
  viewMode: 'list' | 'grid'
  selectedNode: FSNode | null
  canImportDirectory: boolean
  onToggleView: () => void
  onCreateFolder: () => void
  onCreateTextFile: () => void
  onImportFiles: () => void
  onImportDirectory: () => void
  onExportSelected: () => void
  onRenameSelected: () => void
  onDeleteSelected: () => void
}

export function ExplorerToolbar({
  viewMode,
  selectedNode,
  canImportDirectory,
  onToggleView,
  onCreateFolder,
  onCreateTextFile,
  onImportFiles,
  onImportDirectory,
  onExportSelected,
  onRenameSelected,
  onDeleteSelected,
}: ExplorerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs" onClick={onCreateFolder} type="button">
        New Folder
      </button>
      <button className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs" onClick={onCreateTextFile} type="button">
        New Text
      </button>
      <button className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs" onClick={onImportFiles} type="button">
        Import Files
      </button>
      <button
        className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canImportDirectory}
        onClick={onImportDirectory}
        type="button"
      >
        Import Folder
      </button>
      <button
        className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!selectedNode || selectedNode.kind === 'directory'}
        onClick={onExportSelected}
        type="button"
      >
        Export
      </button>
      <button
        className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!selectedNode}
        onClick={onRenameSelected}
        type="button"
      >
        Rename
      </button>
      <button
        className="rounded-md border border-red-400/40 bg-red-500/20 px-2 py-1 text-xs text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!selectedNode}
        onClick={onDeleteSelected}
        type="button"
      >
        Delete
      </button>
      <button
        className="ml-auto rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs"
        onClick={onToggleView}
        type="button"
      >
        {viewMode === 'list' ? 'Grid View' : 'List View'}
      </button>
    </div>
  )
}
