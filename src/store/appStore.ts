import { create } from 'zustand'

import { launcherApps } from '@/app/appRegistry'
import type { AppDefinition } from '@/types/app'

type AppStore = {
  apps: AppDefinition[]
  recentlyUsed: string[]
  markAppUsed: (appId: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  apps: launcherApps,
  recentlyUsed: [],
  markAppUsed: (appId) =>
    set((state) => ({
      recentlyUsed: [appId, ...state.recentlyUsed.filter((id) => id !== appId)].slice(0, 6),
    })),
}))
