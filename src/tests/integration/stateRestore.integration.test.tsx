import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers'
import { fsService } from '@/features/filesystem/fsService'
import { appDb, resetDatabase } from '@/lib/db'
import { useSettingsStore } from '@/store/settingsStore'
import { useWindowStore } from '@/store/windowStore'

describe('State restoration integration', () => {
  beforeEach(async () => {
    await resetDatabase()
    fsService.resetForTests()
    await fsService.init()
    useSettingsStore.setState((state) => ({ ...state, hydrated: false }))
    useWindowStore.setState((state) => ({ ...state, windows: [], topZ: 10 }))
  })

  it('restores settings and windows from IndexedDB', async () => {
    await appDb.settings.put({
      key: 'desktop-settings',
      value: {
        theme: 'light',
        wallpaper: 'linear-gradient(black, white)',
        iconSize: 'lg',
        animations: false,
      },
      updatedAt: Date.now(),
    })

    await appDb.windows.put({
      id: 'window-restored',
      appId: 'terminal',
      title: 'Terminal',
      mode: 'normal',
      zIndex: 99,
      position: { x: 10, y: 10 },
      size: { width: 600, height: 400 },
      minWidth: 520,
      minHeight: 320,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    render(
      <AppProviders>
        <div>ready</div>
      </AppProviders>,
    )

    await screen.findByText('ready')

    await waitFor(() => {
      expect(useSettingsStore.getState().settings.theme).toBe('light')
      expect(useWindowStore.getState().windows.some((win) => win.id === 'window-restored')).toBe(true)
    })
  })
})
