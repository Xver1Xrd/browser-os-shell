import { render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fsService } from '@/features/filesystem/fsService'
import { resetDatabase } from '@/lib/db'
import type { ImportedFileData } from '@/types/fs'

let importedFiles: ImportedFileData[] = []
const noop = () => {}

const mockProvider = {
  getCapabilities: () => ({
    canPickFiles: true,
    canPickDirectories: false,
    canSaveFiles: true,
    canDragDropImport: true,
  }),
  pickFiles: vi.fn(async () => importedFiles),
  saveFile: vi.fn(async () => {}),
}

vi.mock('@/app/providers', () => ({
  useNotifyError: () => noop,
  useNotifySuccess: () => noop,
}))

vi.mock('@/features/filesystem/fileProviders', () => ({
  getFileProvider: () => mockProvider,
}))

import FileExplorerApp from '@/features/explorer/FileExplorerApp'

describe('Explorer integration', () => {
  beforeEach(async () => {
    importedFiles = []
    mockProvider.pickFiles.mockClear()
    await resetDatabase()
    fsService.resetForTests()
    await fsService.init()
  })

  it('creates folder from toolbar', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Projects')

    const { getByTestId } = render(<FileExplorerApp windowId="window-test" />)
    const explorer = getByTestId('explorer-app')

    const newFolderButton = await within(explorer).findByRole('button', { name: 'New Folder' })
    await userEvent.click(newFolderButton)

    await waitFor(async () => {
      const node = await fsService.resolvePath('/Projects')
      expect(node.kind).toBe('directory')
    })
  })

  it('imports file into VFS', async () => {
    importedFiles = [
      {
        name: 'imported.txt',
        type: 'text/plain',
        size: 11,
        lastModified: Date.now(),
        arrayBuffer: new TextEncoder().encode('hello import').buffer,
      },
    ]

    const { getByTestId } = render(<FileExplorerApp windowId="window-test" />)
    const explorer = getByTestId('explorer-app')

    const importButton = await within(explorer).findByRole('button', { name: 'Import Files' })
    await userEvent.click(importButton)

    await waitFor(async () => {
      const imported = await fsService.resolvePath('/imported.txt')
      expect(imported.kind).toBe('file')
    })
  })
})
