import type {
  FileProvider,
  FileProviderCapabilities,
  ImportedFileData,
  PickFileOptions,
} from '@/types/fs'

function readFromInput(input: HTMLInputElement): Promise<FileList> {
  return new Promise((resolve, reject) => {
    input.onchange = () => {
      if (input.files) {
        resolve(input.files)
      } else {
        reject(new Error('No files selected'))
      }
    }

    input.onerror = () => reject(new Error('File picker failed'))
    input.click()
  })
}

async function filesToImported(files: FileList): Promise<ImportedFileData[]> {
  const result: ImportedFileData[] = []

  for (const file of Array.from(files)) {
    const fileWithPath = file as File & { webkitRelativePath?: string }
    result.push({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      arrayBuffer: await file.arrayBuffer(),
      relativePath: fileWithPath.webkitRelativePath || undefined,
    })
  }

  return result
}

function triggerDownload(name: string, data: Blob): void {
  const url = URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export class InputFallbackFileProvider implements FileProvider {
  getCapabilities(): FileProviderCapabilities {
    return {
      canPickFiles: true,
      canPickDirectories: true,
      canSaveFiles: true,
      canDragDropImport: true,
    }
  }

  async pickFiles(options?: PickFileOptions): Promise<ImportedFileData[]> {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = options?.multiple ?? true

    if (options?.accept?.length) {
      input.accept = options.accept.join(',')
    }

    const files = await readFromInput(input)
    return filesToImported(files)
  }

  async pickDirectory(): Promise<ImportedFileData[]> {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    ;(input as HTMLInputElement & { webkitdirectory?: boolean }).webkitdirectory = true

    const files = await readFromInput(input)
    return filesToImported(files)
  }

  async saveFile(name: string, data: Blob): Promise<void> {
    triggerDownload(name, data)
  }
}
