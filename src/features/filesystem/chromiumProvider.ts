import type {
  FileProvider,
  FileProviderCapabilities,
  ImportedFileData,
  PickFileOptions,
} from '@/types/fs'

type FileSystemWindow = Window &
  typeof globalThis & {
    showOpenFilePicker: (options?: {
      multiple?: boolean
      types?: Array<{
        description?: string
        accept?: Record<string, string[]>
      }>
    }) => Promise<FileSystemFileHandle[]>
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
    showSaveFilePicker: (options?: {
      suggestedName?: string
    }) => Promise<FileSystemFileHandle>
  }

function toAcceptMap(accept?: string[]): Record<string, string[]> | undefined {
  if (!accept || accept.length === 0) {
    return undefined
  }

  return {
    'application/octet-stream': accept,
  }
}

async function readFileData(file: File, relativePath?: string): Promise<ImportedFileData> {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    arrayBuffer: await file.arrayBuffer(),
    relativePath,
  }
}

export class ChromiumFileProvider implements FileProvider {
  getCapabilities(): FileProviderCapabilities {
    return {
      canPickFiles: true,
      canPickDirectories: true,
      canSaveFiles: true,
      canDragDropImport: true,
    }
  }

  async pickFiles(options?: PickFileOptions): Promise<ImportedFileData[]> {
    const apiWindow = window as FileSystemWindow
    const handles = await apiWindow.showOpenFilePicker({
      multiple: options?.multiple ?? true,
      types: options?.accept
        ? [
            {
              description: 'Supported files',
              accept: toAcceptMap(options.accept),
            },
          ]
        : undefined,
    })

    const files: ImportedFileData[] = []
    for (const handle of handles) {
      const file = await handle.getFile()
      files.push(await readFileData(file))
    }

    return files
  }

  async pickDirectory(): Promise<ImportedFileData[]> {
    const apiWindow = window as FileSystemWindow
    const root = await apiWindow.showDirectoryPicker()
    const result: ImportedFileData[] = []

    const walk = async (directoryHandle: FileSystemDirectoryHandle, prefix: string) => {
      const entriesHandle = directoryHandle as FileSystemDirectoryHandle & {
        values: () => AsyncIterable<FileSystemHandle>
      }
      for await (const entry of entriesHandle.values()) {
        if (entry.kind === 'file') {
          const fileHandle = entry as FileSystemFileHandle
          const file = await fileHandle.getFile()
          const relativePath = prefix ? `${prefix}/${file.name}` : file.name
          result.push(await readFileData(file, relativePath))
        } else {
          const directoryEntry = entry as FileSystemDirectoryHandle
          const nextPrefix = prefix ? `${prefix}/${directoryEntry.name}` : directoryEntry.name
          await walk(directoryEntry, nextPrefix)
        }
      }
    }

    await walk(root, '')
    return result
  }

  async saveFile(name: string, data: Blob): Promise<void> {
    const apiWindow = window as FileSystemWindow
    const handle = await apiWindow.showSaveFilePicker({
      suggestedName: name,
    })

    const writer = await handle.createWritable()
    await writer.write(data)
    await writer.close()
  }
}
