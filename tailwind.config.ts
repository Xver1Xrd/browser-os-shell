import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        window: '0 24px 65px -30px rgba(0,0,0,0.6)',
      },
      colors: {
        shell: {
          bg: '#0b1020',
          panel: '#131b35',
          border: '#2a3769',
          accent: '#3f83f8',
          muted: '#91a0c7',
        },
      },
    },
  },
  plugins: [],
}

export default config
