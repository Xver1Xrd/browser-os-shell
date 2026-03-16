import type {
  FileProvider,
  FileProviderCapabilities,
  ImportedFileData,
  PickFileOptions,
} from '@/types/fs'

import { InputFallbackFileProvider } from './fallbackProvider'

export class MobileFallbackFileProvider implements FileProvider {
  private readonly fallback = new InputFallbackFileProvider()

  getCapabilities(): FileProviderCapabilities {
    return {
      canPickFiles: true,
      canPickDirectories: false,
      canSaveFiles: true,
      canDragDropImport: false,
    }
  }

  async pickFiles(options?: PickFileOptions): Promise<ImportedFileData[]> {
    return this.fallback.pickFiles(options)
  }

  async saveFile(name: string, data: Blob): Promise<void> {
    return this.fallback.saveFile(name, data)
  }
}
