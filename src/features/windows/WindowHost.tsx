import { useMemo } from 'react'

import { useWindowStore } from '@/store/windowStore'

import { WindowFrame } from './WindowFrame'

export function WindowHost() {
  const windows = useWindowStore((state) => state.windows)

  const orderedWindows = useMemo(
    () => [...windows].sort((left, right) => left.zIndex - right.zIndex),
    [windows],
  )

  return (
    <div className="pointer-events-none absolute inset-0 bottom-14">
      {orderedWindows.map((windowItem) => (
        <div className="pointer-events-auto" key={windowItem.id}>
          <WindowFrame windowItem={windowItem} />
        </div>
      ))}
    </div>
  )
}
