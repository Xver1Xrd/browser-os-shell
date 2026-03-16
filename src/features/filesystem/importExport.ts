import { arrayBufferToBlob } from '@/lib/fileUtils'
import type { FileProvider, FSNode } from '@/types/fs'

import { fsService } from './fsService'

function getRelativeDirectory(relativePath?: string): string[] {
  if (!relativePath) {
    return []
  }

  const parts = relativePath.split('/').filter(Boolean)
  return parts.slice(0, -1)
}

export async function importWithProvider(provider: FileProvider, parentId: string): Promise<FSNode[]> {
  const importedFiles = await provider.pickFiles({ multiple: true })
  return fsService.importFiles(parentId, importedFiles)
}

export async function importDirectoryWithProvider(
  provider: FileProvider,
  parentId: string,
): Promise<FSNode[]> {
  if (!provider.pickDirectory) {
    return []
  }

  const importedFiles = await provider.pickDirectory()
  const created: FSNode[] = []

  for (const file of importedFiles) {
    const pathSegments = getRelativeDirectory(file.relativePath ?? file.name)
    const fullPath = [...pathSegments, file.name].join('/')
    const node = await fsService.createFileFromRelativePath(
      parentId,
      fullPath,
      file.arrayBuffer,
      file.type,
    )
    created.push(node)
  }

  return created
}

export async function exportNodeWithProvider(provider: FileProvider, nodeId: string): Promise<void> {
  const exported = await fsService.exportFile(nodeId)
  const blob = arrayBufferToBlob(exported.data, exported.mimeType)

  if (provider.saveFile) {
    await provider.saveFile(exported.name, blob)
    return
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = exported.name
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
