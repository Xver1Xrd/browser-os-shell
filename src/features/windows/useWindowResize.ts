import { useCallback, type PointerEvent as ReactPointerEvent } from 'react'

import { useWindowStore } from '@/store/windowStore'
import type { DesktopWindow } from '@/types/window'

type ResizeDirection = 'right' | 'bottom' | 'left' | 'top' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

type ResizeBindings = {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
}

function parseDirection(direction: ResizeDirection) {
  return {
    left: direction.includes('left'),
    right: direction.includes('right'),
    top: direction.includes('top'),
    bottom: direction.includes('bottom'),
  }
}

export function useWindowResize(windowItem: DesktopWindow) {
  const resizeWindow = useWindowStore((state) => state.resizeWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const isMobileMode = useWindowStore((state) => state.isMobileMode)

  const getBindings = useCallback(
    (direction: ResizeDirection): ResizeBindings => ({
      onPointerDown: (event) => {
        if (windowItem.mode !== 'normal' || isMobileMode) {
          return
        }

        event.preventDefault()
        focusWindow(windowItem.id)

        const config = parseDirection(direction)
        const startX = event.clientX
        const startY = event.clientY
        const origin = {
          width: windowItem.size.width,
          height: windowItem.size.height,
          x: windowItem.position.x,
          y: windowItem.position.y,
        }

        const onPointerMove = (moveEvent: PointerEvent) => {
          const deltaX = moveEvent.clientX - startX
          const deltaY = moveEvent.clientY - startY

          let width = origin.width
          let height = origin.height
          let x = origin.x
          let y = origin.y

          if (config.right) {
            width = origin.width + deltaX
          }

          if (config.bottom) {
            height = origin.height + deltaY
          }

          if (config.left) {
            width = origin.width - deltaX
            x = origin.x + deltaX
          }

          if (config.top) {
            height = origin.height - deltaY
            y = origin.y + deltaY
          }

          resizeWindow(
            windowItem.id,
            {
              width,
              height,
            },
            {
              x,
              y,
            },
          )
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
    }),
    [focusWindow, isMobileMode, resizeWindow, windowItem.id, windowItem.mode, windowItem.position.x, windowItem.position.y, windowItem.size.height, windowItem.size.width],
  )

  return {
    getBindings,
  }
}

export type { ResizeDirection }
