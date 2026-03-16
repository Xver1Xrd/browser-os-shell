import type { AppId, AppLaunchParams } from '@/types/app'

export type WindowMode = 'normal' | 'minimized' | 'maximized'

export type WindowPosition = {
  x: number
  y: number
}

export type WindowSize = {
  width: number
  height: number
}

export type DesktopWindow = {
  id: string
  appId: AppId
  title: string
  mode: WindowMode
  focused: boolean
  zIndex: number
  position: WindowPosition
  size: WindowSize
  minWidth: number
  minHeight: number
  restorePosition?: WindowPosition
  restoreSize?: WindowSize
  launchParams?: AppLaunchParams
  createdAt: number
  updatedAt: number
}

export type PersistedWindowState = Pick<
  DesktopWindow,
  | 'id'
  | 'appId'
  | 'title'
  | 'mode'
  | 'zIndex'
  | 'position'
  | 'size'
  | 'minWidth'
  | 'minHeight'
  | 'restorePosition'
  | 'restoreSize'
  | 'launchParams'
  | 'createdAt'
  | 'updatedAt'
>
