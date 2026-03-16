import { describe, expect, it } from 'vitest'

import { basename, joinPath, normalizePath, parentPath, splitPath } from '@/features/filesystem/fsQueries'

describe('filesystem path utilities', () => {
  it('normalizes and splits paths', () => {
    expect(normalizePath('/a//b/../c')).toBe('/a/c')
    expect(splitPath('/a/c')).toEqual(['a', 'c'])
    expect(joinPath('/a', 'b', '../c')).toBe('/a/c')
    expect(basename('/a/c')).toBe('c')
    expect(parentPath('/a/c')).toBe('/a')
  })
})
