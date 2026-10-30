import { useNavigationStore } from '@/store'
import { TopBar } from './TopBar'
import { BottomNav, shouldShowBottomNav } from './BottomNav'

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  const { current } = useNavigationStore()
  const showNav = shouldShowBottomNav(current.name)

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
