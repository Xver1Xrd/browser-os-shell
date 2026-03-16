import { memo } from 'react'

import { DesktopGrid } from './DesktopGrid'

type DesktopProps = {
  onLaunch: (appId: 'explorer' | 'editor' | 'images' | 'terminal' | 'settings' | 'about') => void
  onBackgroundClick: () => void
}

function DesktopComponent({ onLaunch, onBackgroundClick }: DesktopProps) {
  return (
    <main
      className="relative h-full w-full overflow-hidden"
      onClick={onBackgroundClick}
      role="presentation"
      style={{
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.2),transparent_60%)]" />
      <DesktopGrid onLaunch={onLaunch} />
    </main>
  )
}

export const Desktop = memo(DesktopComponent)
