import { detectCapabilities } from '@/lib/capability'
import type { FileProvider } from '@/types/fs'

import { ChromiumFileProvider } from './chromiumProvider'
import { InputFallbackFileProvider } from './fallbackProvider'
import { MobileFallbackFileProvider } from './mobileProvider'

let providerSingleton: FileProvider | null = null

export function createFileProvider(): FileProvider {
  const caps = detectCapabilities()

  if (caps.supportsFileSystemAccess && caps.browserHint === 'chromium') {
    return new ChromiumFileProvider()
  }

  if (caps.isTouchDevice || caps.isMobileViewport || caps.browserHint === 'safari') {
    return new MobileFallbackFileProvider()
  }

  return new InputFallbackFileProvider()
}

export function getFileProvider(): FileProvider {
  if (!providerSingleton) {
    providerSingleton = createFileProvider()
  }

  return providerSingleton
}

export function resetFileProviderForTests(): void {
  providerSingleton = null
}
