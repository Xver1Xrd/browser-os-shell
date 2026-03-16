export type FSNodeKind = 'file' | 'directory'

export type FSNode = {
  id: string
  parentId: string | null
  name: string
  kind: FSNodeKind
  mimeType: string | null
  size: number
  createdAt: number
  updatedAt: number
}

export type FSFileContent = {
  nodeId: string
  data: ArrayBuffer
  updatedAt: number
}

export type FSNodeWithPath = FSNode & {
  path: string
}

export type FSTreeNode = FSNode & {
  children: FSTreeNode[]
}

export type FileProviderCapabilities = {
  canPickFiles: boolean
  canPickDirectories: boolean
  canSaveFiles: boolean
  canDragDropImport: boolean
}

export type ImportedFileData = {
  name: string
  type: string
  size: number
  lastModified: number
  arrayBuffer: ArrayBuffer
  relativePath?: string
}

export type PickFileOptions = {
  multiple?: boolean
  accept?: string[]
}

export interface FileProvider {
  getCapabilities(): FileProviderCapabilities
  pickFiles(options?: PickFileOptions): Promise<ImportedFileData[]>
  pickDirectory?(): Promise<ImportedFileData[]>
  saveFile?(name: string, data: Blob): Promise<void>
}

export const ROOT_DIRECTORY_ID = 'root'
