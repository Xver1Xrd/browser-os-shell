import { useEffect, useState } from 'react'

export function usePersistentState<T>(key: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialState
    }

    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialState
    } catch {
      return initialState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Ignore write failures caused by private mode and quota limits.
    }
  }, [key, state])

  return [state, setState] as const
}
