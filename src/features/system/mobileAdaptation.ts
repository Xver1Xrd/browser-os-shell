export const MOBILE_BREAKPOINT_PX = 768

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches
}

export function getContextMenuHint(isTouchDevice: boolean): string {
  return isTouchDevice ? 'Long press for context actions' : 'Right click for context actions'
}
