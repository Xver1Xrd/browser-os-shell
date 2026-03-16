export type ThemeMode = 'dark' | 'light'

export type DesktopSettings = {
  theme: ThemeMode
  wallpaper: string
  iconSize: 'sm' | 'md' | 'lg'
  animations: boolean
}

export const defaultDesktopSettings: DesktopSettings = {
  theme: 'dark',
  wallpaper:
    'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.45), transparent 45%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.3), transparent 40%), linear-gradient(155deg, #0b1020 0%, #101b3f 55%, #0f172a 100%)',
  iconSize: 'md',
  animations: true,
}
