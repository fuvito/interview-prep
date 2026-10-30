import { useEffect } from 'react'
import { Layout } from '@/components/layout'
import { Router } from './Router'
import { useThemeStore } from '@/store'

export default function App() {
  const { load } = useThemeStore()

  useEffect(() => { void load() }, [load])

  return (
    <div className="w-[480px] h-[600px] bg-gray-950 text-gray-100 flex flex-col overflow-hidden font-sans antialiased">
      <Layout>
        <Router />
      </Layout>
    </div>
  )
}
