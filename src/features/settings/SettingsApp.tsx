import { resetDatabase } from '@/lib/db'
import { detectCapabilities } from '@/lib/capability'
import { useSettingsStore } from '@/store/settingsStore'

const WALLPAPER_PRESETS = [
  {
    id: 'nebula',
    label: 'Nebula',
    value:
      'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.45), transparent 45%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.3), transparent 40%), linear-gradient(155deg, #0b1020 0%, #101b3f 55%, #0f172a 100%)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    value:
      'radial-gradient(circle at top left, rgba(251,146,60,0.35), transparent 45%), radial-gradient(circle at right, rgba(244,114,182,0.28), transparent 42%), linear-gradient(165deg, #1f2937 0%, #111827 40%, #0b1120 100%)',
  },
  {
    id: 'mint',
    label: 'Mint',
    value:
      'radial-gradient(circle at 10% 20%, rgba(20,184,166,0.35), transparent 50%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.28), transparent 35%), linear-gradient(145deg, #022c22 0%, #064e3b 60%, #0f172a 100%)',
  },
]

export default function SettingsApp() {
  const settings = useSettingsStore((state) => state.settings)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const setWallpaper = useSettingsStore((state) => state.setWallpaper)
  const setIconSize = useSettingsStore((state) => state.setIconSize)
  const setAnimations = useSettingsStore((state) => state.setAnimations)
  const resetSettings = useSettingsStore((state) => state.resetSettings)

  const capabilities = detectCapabilities()

  return (
    <div className="h-full overflow-y-auto p-4 text-sm text-slate-200">
      <h2 className="text-lg font-semibold text-slate-100">Settings</h2>

      <section className="mt-4 space-y-2 rounded-lg border border-white/15 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Theme</p>
        <div className="flex gap-2">
          <button
            className={`rounded-md border px-3 py-2 ${settings.theme === 'dark' ? 'border-shell-accent bg-shell-accent/25' : 'border-white/20 bg-white/10'}`}
            onClick={() => setTheme('dark')}
            type="button"
          >
            Dark
          </button>
          <button
            className={`rounded-md border px-3 py-2 ${settings.theme === 'light' ? 'border-shell-accent bg-shell-accent/25' : 'border-white/20 bg-white/10'}`}
            onClick={() => setTheme('light')}
            type="button"
          >
            Light
          </button>
        </div>
      </section>

      <section className="mt-4 space-y-2 rounded-lg border border-white/15 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Wallpaper</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {WALLPAPER_PRESETS.map((preset) => (
            <button
              className={`overflow-hidden rounded-lg border ${preset.value === settings.wallpaper ? 'border-shell-accent' : 'border-white/20'}`}
              key={preset.id}
              onClick={() => setWallpaper(preset.value)}
              type="button"
            >
              <div className="h-16 w-full" style={{ background: preset.value }} />
              <span className="block px-2 py-1 text-xs text-slate-200">{preset.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-2 rounded-lg border border-white/15 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Desktop Icons</p>
        <div className="flex gap-2">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              className={`rounded-md border px-3 py-2 ${settings.iconSize === size ? 'border-shell-accent bg-shell-accent/25' : 'border-white/20 bg-white/10'}`}
              key={size}
              onClick={() => setIconSize(size)}
              type="button"
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-2 rounded-lg border border-white/15 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Effects</p>
        <label className="flex items-center gap-2">
          <input
            checked={settings.animations}
            onChange={(event) => setAnimations(event.target.checked)}
            type="checkbox"
          />
          <span>Enable animations</span>
        </label>
      </section>

      <section className="mt-4 rounded-lg border border-white/15 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Storage</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs"
            onClick={resetSettings}
            type="button"
          >
            Reset Settings
          </button>
          <button
            className="rounded-md border border-red-400/40 bg-red-500/20 px-3 py-2 text-xs text-red-100"
            onClick={async () => {
              if (!confirm('Reset storage? This will remove all files and settings.')) {
                return
              }

              await resetDatabase()
              location.reload()
            }}
            type="button"
          >
            Reset All Storage
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-white/15 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Platform Capabilities</p>
        <div className="mt-2 space-y-1 text-xs text-slate-300">
          <p>Browser: {capabilities.browserHint}</p>
          <p>File System Access API: {String(capabilities.supportsFileSystemAccess)}</p>
          <p>Directory picker: {String(capabilities.supportsDirectoryPicker)}</p>
          <p>Save picker: {String(capabilities.supportsSavePicker)}</p>
          <p>Touch device: {String(capabilities.isTouchDevice)}</p>
        </div>
      </section>
    </div>
  )
}
