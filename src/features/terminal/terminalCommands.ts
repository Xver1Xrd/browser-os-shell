import { fsService } from '@/features/filesystem/fsService'
import { ROOT_DIRECTORY_ID, type FSNode } from '@/types/fs'

export type TerminalExecutionResult = {
  output?: string
  cwdId?: string
  clear?: boolean
}

export type TerminalExecutionState = {
  cwdId: string
}

const HELP_TEXT = `Available commands:
help
pwd
ls [path]
cd [path]
mkdir <name>
touch <name>
cat <file>
rm <name|path>
clear
echo <text>
tree [path]`

function parseArgs(input: string): string[] {
  const matches = input.match(/"([^"]*)"|'([^']*)'|\S+/g)
  if (!matches) {
    return []
  }

  return matches.map((token) => {
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      return token.slice(1, -1)
    }

    return token
  })
}

async function formatTree(node: FSNode, depth = 0): Promise<string[]> {
  const prefix = depth === 0 ? '' : `${'  '.repeat(depth - 1)}- `
  const lines = [`${prefix}${node.name}`]

  if (node.kind === 'directory') {
    const children = await fsService.listChildren(node.id)
    for (const child of children) {
      const branch = await formatTree(child, depth + 1)
      lines.push(...branch)
    }
  }

  return lines
}

async function resolveNode(pathArg: string | undefined, cwdId: string): Promise<FSNode> {
  if (!pathArg) {
    return fsService.getNode(cwdId)
  }

  return fsService.resolvePath(pathArg, cwdId)
}

export async function executeTerminalCommand(
  rawInput: string,
  state: TerminalExecutionState,
): Promise<TerminalExecutionResult> {
  const args = parseArgs(rawInput.trim())
  if (args.length === 0) {
    return {}
  }

  const [command, ...commandArgs] = args

  switch (command) {
    case 'help':
      return { output: HELP_TEXT }

    case 'pwd': {
      return { output: await fsService.getPath(state.cwdId) }
    }

    case 'ls': {
      const target = await resolveNode(commandArgs[0], state.cwdId)
      if (target.kind === 'file') {
        return { output: target.name }
      }

      const children = await fsService.listChildren(target.id)
      return {
        output: children
          .map((node) => (node.kind === 'directory' ? `${node.name}/` : node.name))
          .join('\n'),
      }
    }

    case 'cd': {
      const pathArg = commandArgs[0] ?? '/'
      if (pathArg === '/') {
        return { cwdId: ROOT_DIRECTORY_ID }
      }

      const target = await fsService.resolvePath(pathArg, state.cwdId)
      if (target.kind !== 'directory') {
        throw new Error('cd target is not a directory')
      }

      return { cwdId: target.id }
    }

    case 'mkdir': {
      const name = commandArgs[0]
      if (!name) {
        throw new Error('mkdir requires directory name')
      }

      await fsService.createDirectory(state.cwdId, name)
      return { output: `Created ${name}` }
    }

    case 'touch': {
      const name = commandArgs[0]
      if (!name) {
        throw new Error('touch requires file name')
      }

      await fsService.createTextFile(state.cwdId, name, '')
      return { output: `Created ${name}` }
    }

    case 'cat': {
      const pathArg = commandArgs[0]
      if (!pathArg) {
        throw new Error('cat requires file path')
      }

      const node = await fsService.resolvePath(pathArg, state.cwdId)
      if (node.kind !== 'file') {
        throw new Error('cat requires a file')
      }

      const text = await fsService.readTextFile(node.id)
      return { output: text }
    }

    case 'rm': {
      const pathArg = commandArgs[0]
      if (!pathArg) {
        throw new Error('rm requires path')
      }

      const node = await fsService.resolvePath(pathArg, state.cwdId)
      if (node.id === ROOT_DIRECTORY_ID) {
        throw new Error('cannot remove root directory')
      }

      await fsService.deleteNode(node.id)
      return { output: `Removed ${pathArg}` }
    }

    case 'clear':
      return { clear: true }

    case 'echo':
      return { output: commandArgs.join(' ') }

    case 'tree': {
      const node = await resolveNode(commandArgs[0], state.cwdId)
      const lines = await formatTree(node)
      return { output: lines.join('\n') }
    }

    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

export function getPrompt(path: string): string {
  return `webos:${path}$`
}
