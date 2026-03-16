export type AppId =
  | 'explorer'
  | 'editor'
  | 'images'
  | 'terminal'
  | 'settings'
  | 'about'

export type AppLaunchParams = {
  nodeId?: string
  path?: string
  mode?: 'view' | 'edit'
}

export type AppRuntimeProps = {
  windowId: string
  launchParams?: AppLaunchParams
}

export type AppDefinition = {
  id: AppId
  name: string
  description: string
  icon: string
  singleton?: boolean
  minWidth: number
  minHeight: number
  defaultWidth: number
  defaultHeight: number
}
