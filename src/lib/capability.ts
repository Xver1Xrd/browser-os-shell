export type CapabilityReport = {
  supportsFileSystemAccess: boolean
  supportsDirectoryPicker: boolean
  supportsSavePicker: boolean
  supportsDragDropImport: boolean
  isTouchDevice: boolean
  isMobileViewport: boolean
  isStandalonePwa: boolean
  browserHint: 'chromium' | 'safari' | 'firefox' | 'unknown'
}

type FileSystemWindow = Window &
  typeof globalThis & {
    showOpenFilePicker?: (options?: unknown) => Promise<unknown>
    showSaveFilePicker?: (options?: unknown) => Promise<unknown>
    showDirectoryPicker?: (options?: unknown) => Promise<unknown>
  }

function hasNavigator(): boolean {
  return typeof navigator !== 'undefined'
}

export function detectBrowserHint(): CapabilityReport['browserHint'] {
  if (!hasNavigator()) {
    return 'unknown'
  }

  const ua = navigator.userAgent.toLowerCase()

  if (ua.includes('firefox')) {
    return 'firefox'
  }

  if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'safari'
  }

  if (ua.includes('chrome') || ua.includes('edg')) {
    return 'chromium'
  }

  return 'unknown'
}

export function detectCapabilities(): CapabilityReport {
  const globalWindow =
    typeof window !== 'undefined' ? (window as FileSystemWindow) : undefined
  const supportsFileSystemAccess =
    typeof globalWindow?.showOpenFilePicker === 'function' &&
    typeof globalWindow?.showSaveFilePicker === 'function'

  const supportsDirectoryPicker = typeof globalWindow?.showDirectoryPicker === 'function'
  const supportsSavePicker = typeof globalWindow?.showSaveFilePicker === 'function'

  const isTouchDevice =
    !!globalWindow &&
    (navigator.maxTouchPoints > 0 || 'ontouchstart' in globalWindow || 'TouchEvent' in globalWindow)

  const isMobileViewport = !!globalWindow && globalWindow.matchMedia('(max-width: 768px)').matches
  const isStandalonePwa =
    !!globalWindow &&
    (globalWindow.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true)

  return {
    supportsFileSystemAccess,
    supportsDirectoryPicker,
    supportsSavePicker,
    supportsDragDropImport: !isTouchDevice,
    isTouchDevice,
    isMobileViewport,
    isStandalonePwa,
    browserHint: detectBrowserHint(),
  }
}
