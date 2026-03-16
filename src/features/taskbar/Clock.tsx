import { useEffect, useState } from 'react'

import { formatTime } from '@/lib/time'

export function Clock() {
  const [timestamp, setTimestamp] = useState(() => Date.now())

  useEffect(() => {
    const handle = window.setInterval(() => setTimestamp(Date.now()), 1000 * 30)
    return () => window.clearInterval(handle)
  }, [])

  return <span className="font-mono text-xs text-slate-200">{formatTime(timestamp)}</span>
}
