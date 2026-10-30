import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout'
import { Router } from './Router'
import { useThemeStore, useNavigationStore } from '@/store'
import { uploadedContentRepository } from '@/database/repositories'
import { registerUploadedPacks } from '@/content'
import { usePopupSize } from '@/hooks/usePopupSize'

// Detect popup vs full-tab via URL param (width-independent and stable across sizes)
export const isPopup = !new URLSearchParams(window.location.search).has('tab')

export default function App() {
  const { load } = useThemeStore()
  const { initCurrentSubject } = useNavigationStore()
  const [ready, setReady] = useState(false)
  const { size } = usePopupSize()

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

  const outerClass = isPopup
    ? 'relative overflow-hidden bg-gray-950 text-gray-100 font-sans antialiased ring-1 ring-gray-800'
    : 'w-full h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden font-sans antialiased ring-1 ring-gray-800'

  const outerStyle = isPopup ? { width: size.w, height: size.h } : undefined

  if (!ready) return <div className={outerClass} style={outerStyle} />

  return (
    <div className={outerClass} style={outerStyle}>
      <div className={isPopup ? 'flex flex-col overflow-hidden w-full h-full' : 'contents'}>
        <Layout>
          <Router />
        </Layout>
      </div>
    </div>
  )
}
