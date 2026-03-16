import { useEffect } from 'react'

type Shortcut = {
  key: string
  ctrlOrMeta?: boolean
  shift?: boolean
  callback: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const metaMatch = shortcut.ctrlOrMeta
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !shortcut.shift || !event.shiftKey

        if (keyMatch && metaMatch && shiftMatch) {
          event.preventDefault()
          shortcut.callback()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
