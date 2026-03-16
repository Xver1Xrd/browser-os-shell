import { useMemo } from 'react'

import { appRegistry } from '@/app/appRegistry'
import { useDesktopStore } from '@/store/desktopStore'

import { DesktopIcon } from './DesktopIcon'

type DesktopGridProps = {
  onLaunch: (appId: keyof typeof appRegistry) => void
}

export function DesktopGrid({ onLaunch }: DesktopGridProps) {
  const iconOrder = useDesktopStore((state) => state.iconOrder)

  const apps = useMemo(
    () => iconOrder.map((appId) => appRegistry[appId]).filter(Boolean),
    [iconOrder],
  )

  return (
    <div className="grid w-full grid-flow-col grid-rows-4 gap-4 p-4 sm:grid-rows-6">
      {apps.map((app) => (
        <DesktopIcon key={app.id} app={app} onLaunch={onLaunch} />
      ))}
    </div>
  )
}
