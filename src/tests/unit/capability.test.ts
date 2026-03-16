import { describe, expect, it } from 'vitest'

import { detectCapabilities } from '@/lib/capability'

describe('capability detection', () => {
  it('returns capability report shape', () => {
    const capabilities = detectCapabilities()

    expect(typeof capabilities.supportsFileSystemAccess).toBe('boolean')
    expect(typeof capabilities.supportsDirectoryPicker).toBe('boolean')
    expect(typeof capabilities.supportsSavePicker).toBe('boolean')
    expect(typeof capabilities.isTouchDevice).toBe('boolean')
  })
})
