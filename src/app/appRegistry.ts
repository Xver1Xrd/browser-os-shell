import type { LazyExoticComponent, ComponentType } from 'react'
import { lazy } from 'react'

import type { AppDefinition, AppId, AppRuntimeProps } from '@/types/app'

export type AppModule = LazyExoticComponent<ComponentType<AppRuntimeProps>>

export const appRegistry: Record<AppId, AppDefinition> = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Browse and manage virtual files',
    icon: 'EX',
    singleton: true,
    minWidth: 520,
    minHeight: 360,
    defaultWidth: 900,
    defaultHeight: 560,
  },
  editor: {
    id: 'editor',
    name: 'Text Editor',
    description: 'Edit text-based files',
    icon: 'ED',
    singleton: false,
    minWidth: 480,
    minHeight: 340,
    defaultWidth: 860,
    defaultHeight: 540,
  },
  images: {
    id: 'images',
    name: 'Image Viewer',
    description: 'Preview images stored in VFS',
    icon: 'IM',
    singleton: false,
    minWidth: 420,
    minHeight: 320,
    defaultWidth: 760,
    defaultHeight: 520,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Run filesystem commands',
    icon: 'TM',
    singleton: true,
    minWidth: 520,
    minHeight: 320,
    defaultWidth: 840,
    defaultHeight: 460,
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'Customize desktop behavior',
    icon: 'ST',
    singleton: true,
    minWidth: 480,
    minHeight: 360,
    defaultWidth: 720,
    defaultHeight: 520,
  },
  about: {
    id: 'about',
    name: 'About',
    description: 'Platform capabilities and info',
    icon: 'AB',
    singleton: true,
    minWidth: 420,
    minHeight: 300,
    defaultWidth: 560,
    defaultHeight: 420,
  },
}

export const appComponents: Record<AppId, AppModule> = {
  explorer: lazy(() => import('@/features/explorer/FileExplorerApp')),
  editor: lazy(() => import('@/features/editor/TextEditorApp')),
  images: lazy(() => import('@/features/images/ImageViewerApp')),
  terminal: lazy(() => import('@/features/terminal/TerminalApp')),
  settings: lazy(() => import('@/features/settings/SettingsApp')),
  about: lazy(() => import('@/features/system/AboutApp')),
}

export function getAppDefinition(appId: AppId): AppDefinition {
  return appRegistry[appId]
}

export const launcherApps: AppDefinition[] = Object.values(appRegistry)
