import { appDb, openDatabaseSafe } from '@/lib/db'
import { withUniqueName } from '@/lib/fileUtils'
import { guessMimeType } from '@/lib/mime'
import { createId } from '@/lib/id'
import { ROOT_DIRECTORY_ID, type FSNode, type FSNodeWithPath, type FSTreeNode, type ImportedFileData } from '@/types/fs'

import { splitPath } from './fsQueries'
import { assert, validateNodeName, VfsError } from './vfs'

type CreateFileInput = {
  parentId: string
  name: string
  data: ArrayBuffer
  mimeType?: string
}

class FileSystemService {
  private initialized = false

  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    await openDatabaseSafe()
    await this.ensureSeedData()
    this.initialized = true
  }

  async ensureSeedData(): Promise<void> {
    const now = Date.now()
    let root = await appDb.nodes.get(ROOT_DIRECTORY_ID)
    if (!root) {
      root = {
        id: ROOT_DIRECTORY_ID,
        parentId: null,
        name: '/',
        kind: 'directory',
        mimeType: null,
        size: 0,
        createdAt: now,
        updatedAt: now,
      }
      await appDb.nodes.put(root)
    }

    const ensureDirectory = async (name: string): Promise<FSNode> => {
      const existing = await appDb.nodes.where('[parentId+name]').equals([ROOT_DIRECTORY_ID, name]).first()
      if (existing && existing.kind === 'directory') {
        return existing
      }

      const directory: FSNode = {
        id: createId('dir'),
        parentId: ROOT_DIRECTORY_ID,
        name,
        kind: 'directory',
        mimeType: null,
        size: 0,
        createdAt: now,
        updatedAt: now,
      }

      await appDb.nodes.put(directory)
      return directory
    }

    const documents = await ensureDirectory('Documents')
    await ensureDirectory('Pictures')

    const welcomeFile = await appDb.nodes
      .where('[parentId+name]')
      .equals([documents.id, 'Welcome.txt'])
      .first()

    if (!welcomeFile) {
      const readmeId = createId('file')
      const welcomeText =
        'Welcome to Browser OS Shell.\n\nUse Explorer, Terminal and Editor to manage your virtual files.'
      const data = new TextEncoder().encode(welcomeText).buffer
      await appDb.nodes.put({
        id: readmeId,
        parentId: documents.id,
        name: 'Welcome.txt',
        kind: 'file',
        mimeType: 'text/plain',
        size: data.byteLength,
        createdAt: now,
        updatedAt: now,
      })
      await appDb.files.put({
        nodeId: readmeId,
        data,
        updatedAt: now,
      })
    }
  }

  private async assertDirectory(nodeId: string): Promise<FSNode> {
    const node = await appDb.nodes.get(nodeId)
    assert(!!node, 'NOT_FOUND', `Node ${nodeId} not found`)
    assert(node.kind === 'directory', 'NOT_A_DIRECTORY', `${node.name} is not a directory`)
    return node
  }

  async getNode(nodeId: string): Promise<FSNode> {
    await this.init()
    const node = await appDb.nodes.get(nodeId)
    assert(!!node, 'NOT_FOUND', `Node ${nodeId} not found`)
    return node
  }

  async listChildren(parentId: string): Promise<FSNode[]> {
    await this.init()
    await this.assertDirectory(parentId)
    const children = await appDb.nodes.where('parentId').equals(parentId).toArray()
    return children.sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind === 'directory' ? -1 : 1
      }

      return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
    })
  }

  async getPath(nodeId: string): Promise<string> {
    await this.init()
    if (nodeId === ROOT_DIRECTORY_ID) {
      return '/'
    }

    const segments: string[] = []
    let current: FSNode | undefined = await appDb.nodes.get(nodeId)

    assert(!!current, 'NOT_FOUND', 'Node not found')

    while (current && current.id !== ROOT_DIRECTORY_ID) {
      segments.push(current.name)
      current = current.parentId ? await appDb.nodes.get(current.parentId) : undefined
    }

    return `/${segments.reverse().join('/')}`
  }

  async resolvePath(path: string, cwdId = ROOT_DIRECTORY_ID): Promise<FSNode> {
    await this.init()
    const isAbsolute = path.startsWith('/')
    const baseSegments = isAbsolute ? [] : splitPath(await this.getPath(cwdId))

    for (const segment of splitPath(path)) {
      if (segment === '..') {
        baseSegments.pop()
      } else if (segment !== '.') {
        baseSegments.push(segment)
      }
    }

    let currentId = ROOT_DIRECTORY_ID

    for (const segment of baseSegments) {
      const child = await appDb.nodes
        .where('[parentId+name]')
        .equals([currentId, segment])
        .first()

      if (!child) {
        throw new VfsError('NOT_FOUND', `Path not found: ${path}`)
      }

      currentId = child.id
    }

    return this.getNode(currentId)
  }

  async findByPath(path: string): Promise<FSNode | undefined> {
    try {
      return await this.resolvePath(path)
    } catch {
      return undefined
    }
  }

  private async checkNameConflict(parentId: string, name: string, ignoreId?: string): Promise<void> {
    const existing = await appDb.nodes.where('[parentId+name]').equals([parentId, name]).first()
    assert(!existing || existing.id === ignoreId, 'ALREADY_EXISTS', `"${name}" already exists`)
  }

  async createDirectory(parentId: string, name: string): Promise<FSNode> {
    await this.init()
    const validName = validateNodeName(name)
    await this.assertDirectory(parentId)
    await this.checkNameConflict(parentId, validName)

    const timestamp = Date.now()
    const node: FSNode = {
      id: createId('dir'),
      parentId,
      name: validName,
      kind: 'directory',
      mimeType: null,
      size: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await appDb.nodes.add(node)
    return node
  }

  async createFile({ parentId, name, data, mimeType }: CreateFileInput): Promise<FSNode> {
    await this.init()
    const validName = validateNodeName(name)
    await this.assertDirectory(parentId)
    await this.checkNameConflict(parentId, validName)

    const timestamp = Date.now()
    const nodeId = createId('file')
    const node: FSNode = {
      id: nodeId,
      parentId,
      name: validName,
      kind: 'file',
      mimeType: mimeType ?? guessMimeType(validName),
      size: data.byteLength,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await appDb.transaction('rw', appDb.nodes, appDb.files, async () => {
      await appDb.nodes.add(node)
      await appDb.files.put({
        nodeId,
        data,
        updatedAt: timestamp,
      })
    })

    return node
  }

  async createTextFile(parentId: string, name: string, text: string): Promise<FSNode> {
    const data = new TextEncoder().encode(text).buffer
    return this.createFile({
      parentId,
      name,
      data,
      mimeType: 'text/plain',
    })
  }

  async readFile(nodeId: string): Promise<ArrayBuffer> {
    await this.init()
    const node = await this.getNode(nodeId)
    assert(node.kind === 'file', 'IS_DIRECTORY', `${node.name} is a directory`)

    const file = await appDb.files.get(nodeId)
    assert(!!file, 'NOT_FOUND', `File content for ${node.name} not found`)
    return file.data
  }

  async readTextFile(nodeId: string): Promise<string> {
    const data = await this.readFile(nodeId)
    return new TextDecoder().decode(data)
  }

  async writeFile(nodeId: string, data: ArrayBuffer, mimeType?: string): Promise<FSNode> {
    await this.init()
    const node = await this.getNode(nodeId)
    assert(node.kind === 'file', 'IS_DIRECTORY', `${node.name} is a directory`)

    const timestamp = Date.now()
    const updatedNode: FSNode = {
      ...node,
      size: data.byteLength,
      updatedAt: timestamp,
      mimeType: mimeType ?? node.mimeType,
    }

    await appDb.transaction('rw', appDb.nodes, appDb.files, async () => {
      await appDb.nodes.put(updatedNode)
      await appDb.files.put({
        nodeId,
        data,
        updatedAt: timestamp,
      })
    })

    return updatedNode
  }

  async renameNode(nodeId: string, name: string): Promise<FSNode> {
    await this.init()
    const node = await this.getNode(nodeId)
    assert(node.parentId !== null, 'INVALID_OPERATION', 'Cannot rename root directory')

    const validName = validateNodeName(name)
    await this.checkNameConflict(node.parentId, validName, node.id)

    const updatedNode = {
      ...node,
      name: validName,
      updatedAt: Date.now(),
    }

    await appDb.nodes.put(updatedNode)
    return updatedNode
  }

  private async collectDescendantIds(nodeId: string): Promise<string[]> {
    const result: string[] = []
    const queue = [nodeId]

    while (queue.length > 0) {
      const current = queue.shift()!
      result.push(current)
      const children = await appDb.nodes.where('parentId').equals(current).toArray()
      for (const child of children) {
        queue.push(child.id)
      }
    }

    return result
  }

  private async isDescendant(nodeId: string, possibleParentId: string): Promise<boolean> {
    let current = await appDb.nodes.get(possibleParentId)

    while (current?.parentId) {
      if (current.parentId === nodeId) {
        return true
      }

      current = await appDb.nodes.get(current.parentId)
    }

    return false
  }

  async moveNode(nodeId: string, targetParentId: string, newName?: string): Promise<FSNode> {
    await this.init()
    const node = await this.getNode(nodeId)
    assert(node.parentId !== null, 'INVALID_OPERATION', 'Cannot move root directory')
    await this.assertDirectory(targetParentId)

    if (node.kind === 'directory') {
      const isDescendant = await this.isDescendant(node.id, targetParentId)
      assert(!isDescendant, 'INVALID_OPERATION', 'Cannot move directory into its descendant')
    }

    const nameToUse = newName ? validateNodeName(newName) : node.name
    await this.checkNameConflict(targetParentId, nameToUse, node.id)

    const movedNode: FSNode = {
      ...node,
      parentId: targetParentId,
      name: nameToUse,
      updatedAt: Date.now(),
    }

    await appDb.nodes.put(movedNode)
    return movedNode
  }

  async deleteNode(nodeId: string): Promise<void> {
    await this.init()
    assert(nodeId !== ROOT_DIRECTORY_ID, 'INVALID_OPERATION', 'Cannot delete root directory')
    const node = await this.getNode(nodeId)
    const descendantIds = await this.collectDescendantIds(node.id)

    await appDb.transaction('rw', appDb.nodes, appDb.files, async () => {
      const fileNodeIds = await appDb.nodes
        .where('id')
        .anyOf(descendantIds)
        .and((candidate) => candidate.kind === 'file')
        .primaryKeys()

      await appDb.files.bulkDelete(fileNodeIds as string[])
      await appDb.nodes.bulkDelete(descendantIds)
    })
  }

  async getTree(rootNodeId = ROOT_DIRECTORY_ID): Promise<FSTreeNode> {
    await this.init()
    const root = await this.getNode(rootNodeId)

    const build = async (node: FSNode): Promise<FSTreeNode> => {
      if (node.kind === 'file') {
        return {
          ...node,
          children: [],
        }
      }

      const children = await this.listChildren(node.id)
      const branch = await Promise.all(children.map((child) => build(child)))

      return {
        ...node,
        children: branch,
      }
    }

    return build(root)
  }

  async searchByName(query: string): Promise<FSNodeWithPath[]> {
    await this.init()
    if (!query.trim()) {
      return []
    }

    const normalized = query.trim().toLowerCase()
    const matches = await appDb.nodes.filter((node) => node.name.toLowerCase().includes(normalized)).toArray()

    const results = await Promise.all(
      matches.map(async (node) => ({
        ...node,
        path: await this.getPath(node.id),
      })),
    )

    return results.sort((left, right) => left.path.localeCompare(right.path))
  }

  async importFiles(parentId: string, files: ImportedFileData[]): Promise<FSNode[]> {
    await this.init()
    await this.assertDirectory(parentId)

    const existing = await this.listChildren(parentId)
    const existingNames = new Set(existing.map((node) => node.name))

    const created: FSNode[] = []

    for (const file of files) {
      const targetName = withUniqueName(file.name, (candidate) => existingNames.has(candidate))
      const node = await this.createFile({
        parentId,
        name: targetName,
        data: file.arrayBuffer,
        mimeType: file.type || guessMimeType(targetName),
      })
      existingNames.add(targetName)
      created.push(node)
    }

    return created
  }

  async exportFile(nodeId: string): Promise<{ name: string; mimeType: string; data: ArrayBuffer }> {
    await this.init()
    const node = await this.getNode(nodeId)
    assert(node.kind === 'file', 'IS_DIRECTORY', 'Cannot export directory as file')

    const data = await this.readFile(nodeId)
    return {
      name: node.name,
      mimeType: node.mimeType ?? 'application/octet-stream',
      data,
    }
  }

  async createFileFromPath(path: string, data: ArrayBuffer, mimeType?: string): Promise<FSNode> {
    await this.init()
    const segments = splitPath(path)
    assert(segments.length > 0, 'INVALID_OPERATION', 'Path must include file name')

    const fileName = segments.pop() as string
    let currentId = ROOT_DIRECTORY_ID

    for (const segment of segments) {
      let child = await appDb.nodes.where('[parentId+name]').equals([currentId, segment]).first()
      if (!child) {
        child = await this.createDirectory(currentId, segment)
      }

      assert(child.kind === 'directory', 'NOT_A_DIRECTORY', `${segment} is not a directory`)
      currentId = child.id
    }

    return this.createFile({
      parentId: currentId,
      name: fileName,
      data,
      mimeType,
    })
  }

  async createFileFromRelativePath(
    parentId: string,
    relativePath: string,
    data: ArrayBuffer,
    mimeType?: string,
  ): Promise<FSNode> {
    await this.init()
    let currentId = parentId
    const segments = relativePath.split('/').filter(Boolean)
    assert(segments.length > 0, 'INVALID_OPERATION', 'Relative path is empty')
    const fileName = segments.pop() as string

    for (const segment of segments) {
      const existing = await appDb.nodes.where('[parentId+name]').equals([currentId, segment]).first()

      if (existing) {
        assert(existing.kind === 'directory', 'NOT_A_DIRECTORY', `${segment} is not a directory`)
        currentId = existing.id
      } else {
        const created = await this.createDirectory(currentId, segment)
        currentId = created.id
      }
    }

    return this.createFile({
      parentId: currentId,
      name: fileName,
      data,
      mimeType,
    })
  }

  resetForTests(): void {
    this.initialized = false
  }
}

export const fsService = new FileSystemService()
