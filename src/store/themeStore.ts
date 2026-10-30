import { create } from 'zustand'
import { userPreferencesRepository } from '@/database/repositories'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  loaded: boolean
  load: () => Promise<void>
  toggle: () => Promise<void>
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('light-mode', theme === 'light')
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  loaded: false,

  load: async () => {
    const prefs = await userPreferencesRepository.get()
    const theme: Theme = prefs.theme === 'light' ? 'light' : 'dark'
    applyTheme(theme)
    set({ theme, loaded: true })
  },

  toggle: async () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
    await userPreferencesRepository.save({ theme: next })
  },
}))
