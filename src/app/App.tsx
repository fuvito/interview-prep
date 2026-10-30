import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Router } from './Router'
import { useThemeStore } from '@/store'
import { uploadedContentRepository } from '@/database/repositories'
import { registerUploadedPacks } from '@/content'

const isPopup = window.innerWidth <= 500
const containerClass = `${isPopup ? 'w-[480px] h-[600px]' : 'w-full h-screen'} bg-gray-950 text-gray-100 flex flex-col overflow-hidden font-sans antialiased ring-1 ring-gray-800`

export default function App() {
  const { load } = useThemeStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function init() {
      const [packs] = await Promise.all([
        uploadedContentRepository.getAll(),
        load(),
      ])
      registerUploadedPacks(packs)
      setReady(true)
    }
    void init()
  }, [load])

  if (!ready) return <div className={containerClass} />

  return (
    <div className={containerClass}>
      <Layout>
        <Router />
      </Layout>
    </div>
  )
}
