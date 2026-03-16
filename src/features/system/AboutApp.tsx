import { detectCapabilities } from '@/lib/capability'

export default function AboutApp() {
  const capabilities = detectCapabilities()

  return (
    <div className="h-full overflow-y-auto p-4 text-sm text-slate-200">
      <h2 className="text-lg font-semibold text-slate-50">Browser OS Shell</h2>
      <p className="mt-2 text-slate-300">
        Browser-based desktop shell with virtual filesystem, launcher, window manager and app runtime.
      </p>

      <div className="mt-4 grid gap-2 rounded-lg border border-white/15 bg-black/20 p-3">
        {Object.entries(capabilities).map(([key, value]) => (
          <div className="flex items-center justify-between border-b border-white/10 py-1 last:border-b-0" key={key}>
            <span className="text-slate-400">{key}</span>
            <span className="font-medium text-slate-100">{String(value)}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        File access is scoped to user-selected files and virtual filesystem storage in IndexedDB.
      </p>
    </div>
  )
}
