import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

import { cleanup } from '@testing-library/react'
import { beforeEach, vi } from 'vitest'
import { afterEach } from 'vitest'

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  cleanup()
})

if (!globalThis.matchMedia) {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof globalThis.matchMedia
}

if (!globalThis.prompt) {
  globalThis.prompt = (() => null) as typeof globalThis.prompt
}

if (!globalThis.confirm) {
  globalThis.confirm = (() => true) as typeof globalThis.confirm
}
