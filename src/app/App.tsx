import { useEffect } from 'react'
import { Layout } from '@/components/layout'
import { Router } from './Router'
import { useThemeStore } from '@/store'

const isPopup = window.innerWidth <= 500

export default function App() {
  const { load } = useThemeStore()

  useEffect(() => { void load() }, [load])

  return (
    <div
      className={`${isPopup ? 'w-[480px] h-[600px]' : 'w-full h-screen'} bg-gray-950 text-gray-100 flex flex-col overflow-hidden font-sans antialiased ring-1 ring-gray-800`}
      style={{ fontSize: 'var(--app-font-size, 15px)' }}
    >
      <Layout>
        <Router />
      </Layout>
    </div>
  )
}
