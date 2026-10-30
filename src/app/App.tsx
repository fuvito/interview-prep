import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Router } from './Router'
import { useThemeStore, useNavigationStore } from '@/store'
import { uploadedContentRepository } from '@/database/repositories'
import { registerUploadedPacks } from '@/content'
import { useResizable } from '@/hooks/useResizable'

const isPopup = window.innerWidth <= 500

export default function App() {
  const { load } = useThemeStore()
  const { initCurrentSubject } = useNavigationStore()
  const [ready, setReady] = useState(false)
  const { size, handles } = useResizable()

  useEffect(() => {
    async function init() {
      const [packs] = await Promise.all([
        uploadedContentRepository.getAll(),
        load(),
        initCurrentSubject(),
      ])
      registerUploadedPacks(packs)
      setReady(true)
    }
    void init()
  }, [load, initCurrentSubject])

  const style = isPopup ? { width: size.w, height: size.h } : undefined
  const outerClass = isPopup
    ? 'relative bg-gray-950 text-gray-100 font-sans antialiased ring-1 ring-gray-800'
    : 'w-full h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden font-sans antialiased ring-1 ring-gray-800'

  if (!ready) return <div className={outerClass} style={style} />

  return (
    <div className={outerClass} style={style}>
      {isPopup && handles.map(h => (
        <div key={h.dir} style={h.style} onMouseDown={h.onMouseDown} />
      ))}
      <div className={isPopup ? 'flex flex-col overflow-hidden w-full h-full' : 'contents'}>
        <Layout>
          <Router />
        </Layout>
      </div>
    </div>
  )
}
