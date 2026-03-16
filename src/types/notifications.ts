export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export type NotificationItem = {
  id: string
  title: string
  message?: string
  level: NotificationLevel
  createdAt: number
}
