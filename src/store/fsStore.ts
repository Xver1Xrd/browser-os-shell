import { create } from 'zustand'

import { ROOT_DIRECTORY_ID } from '@/types/fs'

type ExplorerViewMode = 'list' | 'grid'

type FsStore = {
  currentDirectoryId: string
  selectedNodeId: string | null
  previewNodeId: string | null
  viewMode: ExplorerViewMode
  setCurrentDirectoryId: (nodeId: string) => void
  setSelectedNodeId: (nodeId: string | null) => void
  setPreviewNodeId: (nodeId: string | null) => void
  toggleViewMode: () => void
  setViewMode: (viewMode: ExplorerViewMode) => void
  resetExplorerState: () => void
}

export const useFsStore = create<FsStore>((set) => ({
  currentDirectoryId: ROOT_DIRECTORY_ID,
  selectedNodeId: null,
  previewNodeId: null,
  viewMode: 'list',
  setCurrentDirectoryId: (nodeId) =>
    set({
      currentDirectoryId: nodeId,
      selectedNodeId: null,
      previewNodeId: null,
    }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setPreviewNodeId: (nodeId) => set({ previewNodeId: nodeId }),
  toggleViewMode: () => set((state) => ({ viewMode: state.viewMode === 'list' ? 'grid' : 'list' })),
  setViewMode: (viewMode) => set({ viewMode }),
  resetExplorerState: () =>
    set({
      currentDirectoryId: ROOT_DIRECTORY_ID,
      selectedNodeId: null,
      previewNodeId: null,
      viewMode: 'list',
    }),
}))
