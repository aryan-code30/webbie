import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'lofi' | 'forest' | 'ocean'

export const THEMES: { id: Theme; label: string; accent: string; preview: string }[] = [
  { id: 'dark',   label: 'Dark',   accent: '#7c3aed', preview: '#0d0d0d' },
  { id: 'lofi',   label: 'Lo-fi',  accent: '#d97706', preview: '#16120e' },
  { id: 'forest', label: 'Forest', accent: '#10b981', preview: '#0a110a' },
  { id: 'ocean',  label: 'Ocean',  accent: '#0ea5e9', preview: '#040d1a' },
]

interface ThemeState {
  theme: Theme
  setTheme: (t: Theme) => void
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    { name: 'webbie-theme' }
  )
)

// Apply on initial load before React mounts (prevents flash)
;(function initTheme() {
  try {
    const raw = localStorage.getItem('webbie-theme')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.theme) applyTheme(state.theme)
    }
  } catch {
    // ignore
  }
})()
