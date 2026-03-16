# Browser OS Shell

Production-like browser desktop environment (web OS shell), работающий полностью в браузере. Проект реализует оконный менеджер, систему приложений, виртуальную файловую систему, импорт/экспорт файлов через browser APIs, terminal поверх VFS, настройки и персистентность через IndexedDB.

## Стек

- Vite + React + TypeScript
- Tailwind CSS
- Zustand
- Dexie (IndexedDB)
- Framer Motion
- Zod
- Vitest + React Testing Library
- Playwright
- vite-plugin-pwa

## Основные возможности

- Desktop shell: рабочий стол, иконки, taskbar, start menu
- Window manager: open/close/minimize/maximize/restore, drag/resize, focus, z-index
- App registry + lazy app loading
- Virtual FS: create/rename/delete/move/search/tree, metadata, persistence
- File Explorer: list/grid, breadcrumbs, preview pane, import/export, rename/delete
- Text Editor: open/edit/save/create
- Image Viewer: open images + metadata
- Terminal: `help`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `rm`, `pwd`, `clear`, `echo`, `tree`
- Settings: theme, wallpaper, icon size, animations, reset storage
- Notifications + command palette (apps + files)
- Mobile adaptation: touch-friendly controls, long press hints, mobile window mode
- PWA: manifest + offline service worker

## Архитектура

### Модули

1. App Shell (`src/App.tsx`, `src/app/providers.tsx`)
2. Desktop (`src/features/desktop/*`)
3. Taskbar (`src/features/taskbar/*`)
4. Launcher (`src/features/launcher/*`)
5. Window Manager (`src/features/windows/*`, `src/store/windowStore.ts`)
6. App Registry (`src/app/appRegistry.ts`)
7. Virtual FS (`src/features/filesystem/fsService.ts`, `src/features/filesystem/vfs.ts`)
8. File Provider Layer (`chromiumProvider/fallbackProvider/mobileProvider/fileProviders`)
9. Explorer (`src/features/explorer/*`)
10. Editor (`src/features/editor/TextEditorApp.tsx`)
11. Image Viewer (`src/features/images/ImageViewerApp.tsx`)
12. Terminal (`src/features/terminal/*`)
13. Settings (`src/features/settings/SettingsApp.tsx`)
14. Notifications (`src/features/notifications/*`, `src/store/notificationStore.ts`)
15. Search (`src/features/search/CommandPalette.tsx`)
16. Persistence Layer (`src/lib/db.ts`, hydration in `src/app/providers.tsx`)
17. Mobile Adaptation Layer (`src/features/system/mobileAdaptation.ts`, window mobile mode)

### Проектная структура

```text
.
+- public/
¦  +- icons/icon.svg
¦  L- manifest.webmanifest
+- src/
¦  +- app/
¦  +- components/
¦  +- features/
¦  ¦  +- desktop/
¦  ¦  +- editor/
¦  ¦  +- explorer/
¦  ¦  +- filesystem/
¦  ¦  +- images/
¦  ¦  +- launcher/
¦  ¦  +- notifications/
¦  ¦  +- search/
¦  ¦  +- settings/
¦  ¦  +- system/
¦  ¦  +- taskbar/
¦  ¦  +- terminal/
¦  ¦  L- windows/
¦  +- hooks/
¦  +- lib/
¦  +- store/
¦  +- tests/
¦  ¦  +- unit/
¦  ¦  +- integration/
¦  ¦  L- e2e/
¦  +- types/
¦  +- workers/
¦  +- App.tsx
¦  +- index.css
¦  L- main.tsx
+- playwright.config.ts
+- tailwind.config.ts
+- vite.config.ts
L- ...
```

## Матрица поддержки платформ

| Платформа | Статус | Доступ к файлам |
|---|---|---|
| Windows Chromium | Полная поддержка | File System Access API + fallback import/export |
| Windows non-Chromium | Поддержка с fallback | `input[type=file]`, virtual FS, download export |
| Android Chromium | Поддержка | touch UI, file input fallback, virtual FS |
| Android non-Chromium | Поддержка (базовая) | file input fallback, virtual FS |
| iPhone Safari | Поддержка с ограничениями | только fallback import/export через file input/download |

## Ограничения file access (честно)

- Нет системного доступа ко всей файловой системе устройства.
- Работа с файлами ограничена:
  - виртуальной FS в IndexedDB,
  - файлами/папками, выбранными пользователем через browser APIs.
- На Safari/iPhone отсутствует полноценный Chromium-style File System Access API, используется fallback.

## Запуск

### 1. Установка

```bash
npm install
```

### 2. Dev server

```bash
npm run dev
```

### 3. Lint + typecheck + unit/integration

```bash
npm run lint
npm run typecheck
npm test
```

### 4. E2E

```bash
npx playwright install chromium
npm run test:e2e
```

### 5. Production build

```bash
npm run build
npm run preview
```

## Что покрыто тестами

### Unit

- VFS CRUD
- path utilities
- terminal command execution
- capability detection

### Integration

- create folder from explorer
- import file into FS
- edit in editor and save
- restore state from IndexedDB

### E2E (Playwright)

- open app from launcher
- move/resize window (desktop)
- create folder + editor save flow (desktop)
- mobile viewport smoke

## Known limitations

- Часть desktop-only сценариев e2e пропускается на mobile project (осознанно).
- Нет drag-and-drop import для mobile fallback (по capability).
- Preview worker подключен как отдельный модуль, но текущий preview в Explorer выполняется напрямую в UI потоке для простоты.
- Файлы большого размера в Preview/Editor могут требовать дополнительной оптимизации (стриминг/chunking).

## Future improvements

- Virtualized file list для очень больших директорий
- Более продвинутый shell parser в terminal (pipes/redirection)
- Права доступа/ACL внутри виртуальной FS
- Многовкладочный editor/viewer
- Улучшенные gestures и context menus для mobile
