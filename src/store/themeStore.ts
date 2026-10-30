import { create } from 'zustand'
import { userPreferencesRepository } from '@/database/repositories'

type Theme = 'dark' | 'light'
type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const FONT_PX: Record<FontSize, number> = { xs: 12, sm: 13, md: 15, lg: 17, xl: 19, '2xl': 21 }

interface ThemeState {
  theme: Theme
  fontSize: FontSize
  loaded: boolean
  load: () => Promise<void>
  toggle: () => Promise<void>
  increaseFontSize: () => Promise<void>
  decreaseFontSize: () => Promise<void>
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('light-mode', theme === 'light')
}

function applyFontSize(size: FontSize) {
  document.documentElement.style.fontSize = `${FONT_PX[size]}px`
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  fontSize: 'md',
  loaded: false,

  load: async () => {
    const prefs = await userPreferencesRepository.get()
    const theme: Theme = prefs.theme === 'light' ? 'light' : 'dark'
    const fontSize: FontSize = prefs.fontSize ?? 'md'
    applyTheme(theme)
    applyFontSize(fontSize)
    set({ theme, fontSize, loaded: true })
  },

  toggle: async () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
    await userPreferencesRepository.save({ theme: next, fontSize: get().fontSize })
  },

  increaseFontSize: async () => {
    const order: FontSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const current = get().fontSize
    const next = order[Math.min(order.indexOf(current) + 1, order.length - 1)]
    if (next === current) return
    applyFontSize(next)
    set({ fontSize: next })
    await userPreferencesRepository.save({ theme: get().theme, fontSize: next })
  },

  decreaseFontSize: async () => {
    const order: FontSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const current = get().fontSize
    const next = order[Math.max(order.indexOf(current) - 1, 0)]
    if (next === current) return
    applyFontSize(next)
    set({ fontSize: next })
    await userPreferencesRepository.save({ theme: get().theme, fontSize: next })
  },
}))
