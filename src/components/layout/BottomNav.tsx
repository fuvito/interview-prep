import { Home, BookOpen, BarChart2, Bookmark } from 'lucide-react'
import { useNavigationStore, useThemeStore } from '@/store'
import type { View } from '@/store'

const ICON_SIZE: Record<string, number> = {
  xs: 15, sm: 16, md: 18, lg: 20, xl: 22, '2xl': 24, '3xl': 26, '4xl': 28,
}

const NAV_ITEMS: { view: View; icon: React.FC<{ size?: number }>; label: string }[] = [
  { view: { name: 'dashboard' },  icon: Home,     label: 'Home' },
  { view: { name: 'subjects' },   icon: BookOpen, label: 'Subjects' },
  { view: { name: 'progress' },   icon: BarChart2, label: 'Progress' },
  { view: { name: 'bookmarks' },  icon: Bookmark, label: 'Bookmarks' },
]

const ROOT_VIEWS = new Set(['dashboard', 'subjects', 'progress', 'bookmarks'])

export function BottomNav() {
  const { current, navigateRoot } = useNavigationStore()
  const { fontSize } = useThemeStore()
  const iconSize = ICON_SIZE[fontSize] ?? 18

  return (
    <nav className="h-14 flex items-center border-t border-gray-800 shrink-0 bg-gray-950">
      {NAV_ITEMS.map(({ view, icon: Icon, label }) => {
        const isActive = current.name === view.name
        return (
          <button
            key={view.name}
            onClick={() => navigateRoot(view)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-[0.65rem] font-medium transition-colors
              ${isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={iconSize} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}

export function shouldShowBottomNav(viewName: string): boolean {
  return ROOT_VIEWS.has(viewName)
}
