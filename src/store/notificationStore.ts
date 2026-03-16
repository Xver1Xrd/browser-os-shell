import { create } from 'zustand'

import { createId } from '@/lib/id'
import type { NotificationItem, NotificationLevel } from '@/types/notifications'

type NotificationStore = {
  notifications: NotificationItem[]
  toasts: NotificationItem[]
  push: (input: { title: string; message?: string; level?: NotificationLevel }) => void
  dismiss: (id: string) => void
  dismissToast: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  toasts: [],
  push: ({ title, message, level = 'info' }) =>
    set((state) => {
      const item: NotificationItem = {
        id: createId('notification'),
        title,
        message,
        level,
        createdAt: Date.now(),
      }

      return {
        notifications: [item, ...state.notifications].slice(0, 100),
        toasts: [item, ...state.toasts].slice(0, 5),
      }
    }),
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
      toasts: state.toasts.filter((notification) => notification.id !== id),
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((notification) => notification.id !== id),
    })),
  clearAll: () => set({ notifications: [], toasts: [] }),
}))
