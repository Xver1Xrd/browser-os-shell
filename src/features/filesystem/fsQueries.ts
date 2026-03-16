import { ROOT_DIRECTORY_ID } from '@/types/fs'

export function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '/'
  }

  const segments = path
    .split('/')
    .filter(Boolean)
    .reduce<string[]>((acc, segment) => {
      if (segment === '.') {
        return acc
      }

      if (segment === '..') {
        acc.pop()
        return acc
      }

      acc.push(segment)
      return acc
    }, [])

  return `/${segments.join('/')}`
}

export function splitPath(path: string): string[] {
  const normalized = normalizePath(path)
  if (normalized === '/') {
    return []
  }

  return normalized.slice(1).split('/')
}

export function joinPath(...parts: string[]): string {
  return normalizePath(parts.join('/'))
}

export function basename(path: string): string {
  const segments = splitPath(path)
  return segments[segments.length - 1] ?? ''
}

export function parentPath(path: string): string {
  const segments = splitPath(path)
  if (segments.length <= 1) {
    return '/'
  }

  return `/${segments.slice(0, -1).join('/')}`
}

export function isRootNodeId(nodeId: string): boolean {
  return nodeId === ROOT_DIRECTORY_ID
}
