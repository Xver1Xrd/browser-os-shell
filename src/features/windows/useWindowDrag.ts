import { useCallback, type PointerEvent as ReactPointerEvent } from 'react'

import { useWindowStore } from '@/store/windowStore'
import type { DesktopWindow } from '@/types/window'

type DragState = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
}

export function useWindowDrag(windowItem: DesktopWindow) {
  const moveWindow = useWindowStore((state) => state.moveWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const isMobileMode = useWindowStore((state) => state.isMobileMode)

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (windowItem.mode !== 'normal' || isMobileMode) {
        return
      }

      focusWindow(windowItem.id)

      const state: DragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: windowItem.position.x,
        originY: windowItem.position.y,
      }

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== state.pointerId) {
          return
        }

        const deltaX = moveEvent.clientX - state.startX
        const deltaY = moveEvent.clientY - state.startY

        moveWindow(windowItem.id, {
          x: state.originX + deltaX,
          y: state.originY + deltaY,
        })
      }

      const stop = () => {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', stop)
        window.removeEventListener('pointercancel', stop)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', stop)
      window.addEventListener('pointercancel', stop)
    },
    [focusWindow, isMobileMode, moveWindow, windowItem.id, windowItem.mode, windowItem.position.x, windowItem.position.y],
  )

  return {
    onPointerDown,
  }
}
