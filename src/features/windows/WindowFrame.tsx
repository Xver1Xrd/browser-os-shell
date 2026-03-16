import { Suspense } from 'react'
import { motion } from 'framer-motion'

import { appComponents } from '@/app/appRegistry'
import { useSettingsStore } from '@/store/settingsStore'
import { useWindowStore } from '@/store/windowStore'
import type { DesktopWindow } from '@/types/window'

import { ResizeHandles } from './ResizeHandles'
import { useWindowDrag } from './useWindowDrag'
import { useWindowResize } from './useWindowResize'
import { WindowHeader } from './WindowHeader'

type WindowFrameProps = {
  windowItem: DesktopWindow
}

export function WindowFrame({ windowItem }: WindowFrameProps) {
  const closeWindow = useWindowStore((state) => state.closeWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow)
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow)
  const restoreWindow = useWindowStore((state) => state.restoreWindow)
  const isMobileMode = useWindowStore((state) => state.isMobileMode)
  const animationsEnabled = useSettingsStore((state) => state.settings.animations)

  const { onPointerDown } = useWindowDrag(windowItem)
  const { getBindings } = useWindowResize(windowItem)

  const AppComponent = appComponents[windowItem.appId]

  if (windowItem.mode === 'minimized') {
    return null
  }

  return (
    <motion.section
      animate={
        animationsEnabled
          ? {
              opacity: 1,
              scale: 1,
            }
          : {
              opacity: 1,
            }
      }
      className={`absolute overflow-hidden rounded-xl border border-white/20 bg-slate-900/96 shadow-window ${
        windowItem.focused ? 'ring-1 ring-shell-accent/60' : ''
      }`}
      data-testid={`window-${windowItem.id}`}
      data-app-id={windowItem.appId}
      initial={animationsEnabled ? { opacity: 0, scale: 0.97 } : { opacity: 1 }}
      onPointerDown={() => focusWindow(windowItem.id)}
      style={{
        left: windowItem.position.x,
        top: windowItem.position.y,
        width: windowItem.size.width,
        height: windowItem.size.height,
        zIndex: windowItem.zIndex,
        borderRadius: isMobileMode ? 0 : 12,
      }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      <WindowHeader
        onClose={() => closeWindow(windowItem.id)}
        onMaximize={() => maximizeWindow(windowItem.id)}
        onMinimize={() => minimizeWindow(windowItem.id)}
        onPointerDown={onPointerDown}
        onRestore={() => restoreWindow(windowItem.id)}
        windowItem={windowItem}
      />

      <div className="relative h-[calc(100%-2.75rem)] bg-slate-950/70">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-slate-300">
              Loading app...
            </div>
          }
        >
          <AppComponent launchParams={windowItem.launchParams} windowId={windowItem.id} />
        </Suspense>
      </div>

      {!isMobileMode && windowItem.mode === 'normal' ? <ResizeHandles getBindings={getBindings} /> : null}
    </motion.section>
  )
}
