import { beforeEach, describe, expect, it } from 'vitest'

import { executeTerminalCommand } from '@/features/terminal/terminalCommands'
import { fsService } from '@/features/filesystem/fsService'
import { resetDatabase } from '@/lib/db'

describe('terminal command execution', () => {
  beforeEach(async () => {
    await resetDatabase()
    fsService.resetForTests()
    await fsService.init()
  })

  it('handles mkdir/touch/cd/pwd/cat/rm', async () => {
    let cwdId = 'root'

    await executeTerminalCommand('mkdir demo', { cwdId })
    await executeTerminalCommand('cd demo', { cwdId }).then((result) => {
      cwdId = result.cwdId ?? cwdId
    })

    const pwd = await executeTerminalCommand('pwd', { cwdId })
    expect(pwd.output).toBe('/demo')

    await executeTerminalCommand('touch note.txt', { cwdId })
    const fileNode = await fsService.resolvePath('note.txt', cwdId)
    await fsService.writeFile(fileNode.id, new TextEncoder().encode('content').buffer, 'text/plain')

    const cat = await executeTerminalCommand('cat note.txt', { cwdId })
    expect(cat.output).toBe('content')

    await executeTerminalCommand('rm note.txt', { cwdId })
    await expect(fsService.resolvePath('note.txt', cwdId)).rejects.toThrowError()
  })
})
