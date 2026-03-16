import Dexie, { type Table } from 'dexie'

import type { FSFileContent, FSNode } from '@/types/fs'
import type { DesktopSettings } from '@/types/settings'
import type { PersistedWindowState } from '@/types/window'

const DB_NAME = 'browser-os-shell'

export type KeyValueRecord<T> = {
  key: string
  value: T
  updatedAt: number
}

class AppDatabase extends Dexie {
  nodes!: Table<FSNode, string>
  files!: Table<FSFileContent, string>
  settings!: Table<KeyValueRecord<DesktopSettings>, string>
  desktopState!: Table<KeyValueRecord<unknown>, string>
  windows!: Table<PersistedWindowState, string>

  constructor() {
    super(DB_NAME)

    this.version(1).stores({
      nodes: '&id,parentId,name,kind,updatedAt,[parentId+name]',
      files: '&nodeId,updatedAt',
      settings: '&key,updatedAt',
      desktopState: '&key,updatedAt',
      windows: '&id,appId,zIndex,updatedAt',
    })

    this.version(2)
      .stores({
        nodes: '&id,parentId,name,kind,updatedAt,[parentId+name]',
        files: '&nodeId,updatedAt',
        settings: '&key,updatedAt',
        desktopState: '&key,updatedAt',
        windows: '&id,appId,zIndex,updatedAt',
      })
      .upgrade(async (tx) => {
        await tx.table('desktopState').put({
          key: 'schemaVersion',
          value: 2,
          updatedAt: Date.now(),
        })
      })
  }
}

export const appDb = new AppDatabase()

export async function openDatabaseSafe(): Promise<void> {
  try {
    await appDb.open()
  } catch {
    appDb.close()
    await Dexie.delete(DB_NAME)
    await appDb.open()
  }
}

export async function resetDatabase(): Promise<void> {
  appDb.close()
  await Dexie.delete(DB_NAME)
  await appDb.open()
}
