import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNotifyError, useNotifySuccess } from '@/app/providers'
import { fsService } from '@/features/filesystem/fsService'
import { getFileProvider } from '@/features/filesystem/fileProviders'
import {
  exportNodeWithProvider,
  importDirectoryWithProvider,
  importWithProvider,
} from '@/features/filesystem/importExport'
import { isImageMimeType, isTextMimeType } from '@/lib/mime'
import { useFsStore } from '@/store/fsStore'
import { useWindowStore } from '@/store/windowStore'
import type { AppRuntimeProps } from '@/types/app'
import type { FSNode } from '@/types/fs'

import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs'
import { ExplorerSidebar } from './ExplorerSidebar'
import { ExplorerToolbar } from './ExplorerToolbar'
import { FileGrid } from './FileGrid'
import { FileList } from './FileList'
import { PreviewPane } from './PreviewPane'

async function buildBreadcrumbs(nodeId: string): Promise<BreadcrumbItem[]> {
  const chain: BreadcrumbItem[] = []
  let current = await fsService.getNode(nodeId)

  while (current) {
    chain.push({
      id: current.id,
      name: current.id === 'root' ? 'Root' : current.name,
    })

    if (!current.parentId) {
      break
    }

    current = await fsService.getNode(current.parentId)
  }

  return chain.reverse()
}

export default function FileExplorerApp({ launchParams }: AppRuntimeProps) {
  const currentDirectoryId = useFsStore((state) => state.currentDirectoryId)
  const setCurrentDirectoryId = useFsStore((state) => state.setCurrentDirectoryId)
  const selectedNodeId = useFsStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useFsStore((state) => state.setSelectedNodeId)
  const viewMode = useFsStore((state) => state.viewMode)
  const toggleViewMode = useFsStore((state) => state.toggleViewMode)

  const openWindow = useWindowStore((state) => state.openWindow)

  const notifyError = useNotifyError('Explorer error')
  const notifySuccess = useNotifySuccess('Explorer')

  const [roots, setRoots] = useState<FSNode[]>([])
  const [currentDirectory, setCurrentDirectory] = useState<FSNode | null>(null)
  const [children, setChildren] = useState<FSNode[]>([])
  const [selectedNode, setSelectedNode] = useState<FSNode | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [loading, setLoading] = useState(false)

  const provider = useMemo(() => getFileProvider(), [])
  const capabilities = provider.getCapabilities()

  const refresh = useCallback(
    async (directoryId: string, keepSelection = true) => {
      setLoading(true)
      try {
        const directory = await fsService.getNode(directoryId)
        const nextChildren = await fsService.listChildren(directoryId)
        setCurrentDirectory(directory)
        setChildren(nextChildren)
        setBreadcrumbs(await buildBreadcrumbs(directoryId))

        if (!keepSelection) {
          setSelectedNodeId(null)
        }

        if (selectedNodeId) {
          const exists = nextChildren.find((node) => node.id === selectedNodeId)
          setSelectedNode(exists ?? null)
        }
      } catch (error) {
        notifyError(error)
      } finally {
        setLoading(false)
      }
    },
    [notifyError, selectedNodeId, setSelectedNodeId],
  )

  useEffect(() => {
    void refresh(currentDirectoryId)
  }, [currentDirectoryId, refresh])

  useEffect(() => {
    let disposed = false

    const loadRoots = async () => {
      const rootChildren = await fsService.listChildren('root')
      if (disposed) {
        return
      }

      setRoots([
        {
          id: 'root',
          name: 'Root',
          kind: 'directory',
          parentId: null,
          mimeType: null,
          size: 0,
          createdAt: 0,
          updatedAt: 0,
        },
        ...rootChildren.filter((node) => node.kind === 'directory'),
      ])
    }

    void loadRoots().catch(notifyError)

    return () => {
      disposed = true
    }
  }, [notifyError])

  useEffect(() => {
    if (!selectedNodeId) {
      setSelectedNode(null)
      return
    }

    void fsService
      .getNode(selectedNodeId)
      .then((node) => setSelectedNode(node))
      .catch(() => setSelectedNode(null))
  }, [selectedNodeId])

  useEffect(() => {
    if (!launchParams?.nodeId) {
      return
    }

    let disposed = false

    const applyLaunchTarget = async () => {
      const node = await fsService.getNode(launchParams.nodeId as string)
      if (disposed) {
        return
      }

      if (node.kind === 'directory') {
        setCurrentDirectoryId(node.id)
      } else {
        setSelectedNodeId(node.id)
        if (node.parentId) {
          setCurrentDirectoryId(node.parentId)
        }
      }
    }

    void applyLaunchTarget().catch(notifyError)

    return () => {
      disposed = true
    }
  }, [launchParams?.nodeId, notifyError, setCurrentDirectoryId, setSelectedNodeId])

  const openNode = async (node: FSNode) => {
    if (node.kind === 'directory') {
      setCurrentDirectoryId(node.id)
      return
    }

    if (isImageMimeType(node.mimeType)) {
      openWindow('images', {
        title: node.name,
        launchParams: {
          nodeId: node.id,
        },
      })
      return
    }

    if (isTextMimeType(node.mimeType)) {
      openWindow('editor', {
        title: node.name,
        launchParams: {
          nodeId: node.id,
          mode: 'edit',
        },
      })
      return
    }

    openWindow('explorer', {
      launchParams: {
        nodeId: node.id,
      },
    })
  }

  const createFolder = async () => {
    const name = prompt('Folder name')
    if (!name) {
      return
    }

    await fsService.createDirectory(currentDirectoryId, name)
    notifySuccess(`Created folder ${name}`)
    await refresh(currentDirectoryId, false)
  }

  const createTextFile = async () => {
    const name = prompt('File name', 'NewFile.txt')
    if (!name) {
      return
    }

    const file = await fsService.createTextFile(currentDirectoryId, name, '')
    notifySuccess(`Created ${file.name}`)
    await refresh(currentDirectoryId)
    setSelectedNodeId(file.id)
  }

  const renameSelected = async () => {
    if (!selectedNode) {
      return
    }

    const name = prompt('Rename to', selectedNode.name)
    if (!name) {
      return
    }

    await fsService.renameNode(selectedNode.id, name)
    notifySuccess(`Renamed to ${name}`)
    await refresh(currentDirectoryId)
  }

  const deleteSelected = async () => {
    if (!selectedNode) {
      return
    }

    if (!confirm(`Delete ${selectedNode.name}?`)) {
      return
    }

    await fsService.deleteNode(selectedNode.id)
    notifySuccess(`Deleted ${selectedNode.name}`)
    setSelectedNodeId(null)
    await refresh(currentDirectoryId, false)
  }

  const importFiles = async () => {
    const created = await importWithProvider(provider, currentDirectoryId)
    notifySuccess(`Imported ${created.length} file(s)`)
    await refresh(currentDirectoryId)
  }

  const importDirectory = async () => {
    const created = await importDirectoryWithProvider(provider, currentDirectoryId)
    notifySuccess(`Imported ${created.length} file(s) from folder`)
    await refresh(currentDirectoryId)
  }

  const exportSelected = async () => {
    if (!selectedNode || selectedNode.kind !== 'file') {
      return
    }

    await exportNodeWithProvider(provider, selectedNode.id)
    notifySuccess(`Exported ${selectedNode.name}`)
  }

  return (
    <div className="flex h-full flex-col bg-slate-900/95 text-sm text-slate-100" data-testid="explorer-app">
      <div className="space-y-2 border-b border-white/10 p-2">
        <Breadcrumbs items={breadcrumbs} onNavigate={(nodeId) => setCurrentDirectoryId(nodeId)} />

        <ExplorerToolbar
          canImportDirectory={capabilities.canPickDirectories}
          onCreateFolder={() => void createFolder().catch(notifyError)}
          onCreateTextFile={() => void createTextFile().catch(notifyError)}
          onDeleteSelected={() => void deleteSelected().catch(notifyError)}
          onExportSelected={() => void exportSelected().catch(notifyError)}
          onImportDirectory={() => void importDirectory().catch(notifyError)}
          onImportFiles={() => void importFiles().catch(notifyError)}
          onRenameSelected={() => void renameSelected().catch(notifyError)}
          onToggleView={toggleViewMode}
          selectedNode={selectedNode}
          viewMode={viewMode}
        />
      </div>

      <div className="flex min-h-0 flex-1">
        <ExplorerSidebar
          currentDirectoryId={currentDirectoryId}
          onNavigate={setCurrentDirectoryId}
          roots={roots}
        />

        <section className="relative min-h-0 min-w-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-300">Loading...</div>
          ) : viewMode === 'list' ? (
            <FileList
              nodes={children}
              onOpen={(node) => void openNode(node).catch(notifyError)}
              onSelect={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />
          ) : (
            <FileGrid
              nodes={children}
              onOpen={(node) => void openNode(node).catch(notifyError)}
              onSelect={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />
          )}

          {children.length === 0 && !loading ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
              Folder is empty
            </div>
          ) : null}
        </section>

        <PreviewPane selectedNode={selectedNode} />
      </div>

      <div className="border-t border-white/10 px-3 py-1 text-xs text-slate-400">
        {currentDirectory ? `${currentDirectory.name} | ${children.length} item(s)` : ''}
      </div>
    </div>
  )
}
