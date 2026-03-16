import { useMemo, useRef } from 'react'

type LongPressOptions = {
  delay?: number
  onLongPress: () => void
  onClick?: () => void
}

export function useLongPress({ delay = 550, onLongPress, onClick }: LongPressOptions) {
  const timeoutRef = useRef<number | null>(null)
  const isLongPressRef = useRef(false)

  return useMemo(
    () => ({
      onPointerDown: () => {
        isLongPressRef.current = false
        timeoutRef.current = window.setTimeout(() => {
          isLongPressRef.current = true
          onLongPress()
        }, delay)
      },
      onPointerUp: () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }

        if (!isLongPressRef.current) {
          onClick?.()
        }
      },
      onPointerLeave: () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }
      },
      onPointerCancel: () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current)
        }
      },
    }),
    [delay, onClick, onLongPress],
  )
}
