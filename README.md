# Browser OS Shell

Production-like browser desktop environment (web OS shell) that runs fully in the browser.
The project includes a window manager, app launcher, virtual filesystem, file import/export,
terminal commands over VFS, settings, persistence, mobile adaptation, and PWA support.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- Dexie (IndexedDB)
- Framer Motion
- Zod
- Vitest + React Testing Library
- Playwright
- vite-plugin-pwa

## Features

- Desktop shell: desktop icons, taskbar, start menu
- Window manager: open, close, minimize, maximize, restore, drag, resize, focus, z-index
- App registry with lazy-loaded app modules
- Virtual filesystem: create, rename, delete, move, search, tree, metadata, persistence
- File Explorer: list/grid views, breadcrumbs, preview pane, import/export, rename/delete
- Text Editor: open, edit, save, create text files
- Image Viewer: open image files and show metadata
- Terminal commands: `help`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `rm`, `pwd`, `clear`, `echo`, `tree`
- Settings: theme, wallpaper, icon size, animations, reset storage
- Notifications + command palette (apps and files)
- Mobile adaptation: touch-friendly controls, long-press behavior, mobile window mode
- PWA: manifest + offline service worker

## Architecture Overview

Core modules:

1. App Shell: `src/App.tsx`, `src/app/providers.tsx`
2. Desktop: `src/features/desktop/*`
3. Taskbar: `src/features/taskbar/*`
4. Start Menu / Launcher: `src/features/launcher/*`
5. Window Manager: `src/features/windows/*`, `src/store/windowStore.ts`
6. App Registry: `src/app/appRegistry.ts`
7. Virtual FS: `src/features/filesystem/fsService.ts`, `src/features/filesystem/vfs.ts`
8. File Provider Layer: chromium + fallback + mobile providers
9. File Explorer: `src/features/explorer/*`
10. Text Editor: `src/features/editor/TextEditorApp.tsx`
11. Image Viewer: `src/features/images/ImageViewerApp.tsx`
12. Terminal: `src/features/terminal/*`
13. Settings: `src/features/settings/SettingsApp.tsx`
14. Notifications: `src/features/notifications/*`
15. Search / Command Palette: `src/features/search/CommandPalette.tsx`
16. Persistence Layer: `src/lib/db.ts` + hydration in providers
17. Mobile Adaptation Layer: `src/features/system/mobileAdaptation.ts`

## Project Structure

```text
.
|-- public/
|   |-- icons/icon.svg
|   `-- manifest.webmanifest
|-- src/
|   |-- app/
|   |-- components/
|   |-- features/
|   |   |-- desktop/
|   |   |-- editor/
|   |   |-- explorer/
|   |   |-- filesystem/
|   |   |-- images/
|   |   |-- launcher/
|   |   |-- notifications/
|   |   |-- search/
|   |   |-- settings/
|   |   |-- system/
|   |   |-- taskbar/
|   |   |-- terminal/
|   |   `-- windows/
|   |-- hooks/
|   |-- lib/
|   |-- store/
|   |-- tests/
|   |   |-- unit/
|   |   |-- integration/
|   |   `-- e2e/
|   |-- types/
|   |-- workers/
|   |-- App.tsx
|   |-- index.css
|   `-- main.tsx
|-- playwright.config.ts
|-- tailwind.config.ts
|-- vite.config.ts
`-- README.md
```

## Platform Support Matrix

| Platform | Status | File Access Path |
|---|---|---|
| Windows Chromium | Full support | File System Access API + fallback import/export |
| Windows non-Chromium | Supported (fallback) | `input[type=file]` import, download export, virtual FS |
| Android Chromium | Supported | Touch UI + file input fallback + virtual FS |
| Android non-Chromium | Basic support | File input fallback + virtual FS |
| iPhone Safari | Supported with limits | Fallback import/export only (no full Chromium FS Access API) |

## File Access Limitations

This is a browser shell, not a native system shell.

- No unrestricted access to full device filesystem.
- Access is limited to:
  - virtual filesystem data in IndexedDB
  - files/folders explicitly selected by the user through browser APIs
- On Safari/iPhone, Chromium-style File System Access API is not fully available, so fallback logic is used.

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Lint + typecheck + unit/integration tests:

```bash
npm run lint
npm run typecheck
npm test
```

Run E2E tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Build for production:

```bash
npm run build
npm run preview
```

## Test Coverage

Unit tests:

- virtual FS CRUD
- path utilities
- terminal command execution
- capability detection

Integration tests:

- create folder from explorer
- import file into virtual FS
- edit and save in editor
- restore state from IndexedDB

E2E tests (Playwright):

- open app from launcher
- move/resize window (desktop)
- create folder and editor save flow (desktop)
- mobile viewport smoke test

## Known Limitations

- Some desktop-only E2E scenarios are intentionally skipped on mobile projects.
- No drag-and-drop import in mobile fallback mode.
- Explorer preview currently runs in UI thread for simplicity.
- Very large files may need extra streaming/chunking optimization.

## Future Improvements

- Virtualized large file lists
- More advanced terminal parser (pipes/redirection)
- Virtual FS permissions/ACL
- Multi-tab editor/viewer
- Richer mobile gestures and context menus
