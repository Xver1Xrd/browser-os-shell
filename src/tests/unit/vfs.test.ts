import { beforeEach, describe, expect, it } from 'vitest'

import { fsService } from '@/features/filesystem/fsService'
import { resetDatabase } from '@/lib/db'

describe('virtual filesystem CRUD', () => {
  beforeEach(async () => {
    await resetDatabase()
    fsService.resetForTests()
    await fsService.init()
  })

  it('creates, reads, renames, moves and deletes nodes', async () => {
    const docs = await fsService.resolvePath('/Documents')
    const archive = await fsService.createDirectory(docs.id, 'Archive')

    const file = await fsService.createTextFile(docs.id, 'note.txt', 'hello world')
    const content = await fsService.readTextFile(file.id)
    expect(content).toBe('hello world')

    const renamed = await fsService.renameNode(file.id, 'renamed.txt')
    expect(renamed.name).toBe('renamed.txt')

    const moved = await fsService.moveNode(file.id, archive.id)
    expect(moved.parentId).toBe(archive.id)

    const search = await fsService.searchByName('renamed')
    expect(search.some((node) => node.id === file.id)).toBe(true)

    await fsService.deleteNode(archive.id)
    await expect(fsService.getNode(file.id)).rejects.toThrowError()
  })
})
