import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Upload, Trash2, AlertCircle, Download, RefreshCw, CheckCircle, Package } from 'lucide-react'
import { useNavigationStore } from '@/store'
import { useIconSize } from '@/hooks/useIconSize'
import { questionRepository } from '@/core/question-engine'
import { uploadedContentRepository, officialPackRepository } from '@/database/repositories'
import { registerUploadedPacks, deregisterUploadedPack, registerOfficialPacks, deregisterOfficialPack } from '@/content'
import { parseSubjectPack, ImportError } from '@/lib/subjectImporter'
import type { SubjectRegistryEntry, OfficialSubjectPack, UploadedSubjectPack } from '@/types'
import registryData from '../../../public/registry.json'

const REGISTRY = registryData as { subjects: SubjectRegistryEntry[] }

type DownloadState = 'idle' | 'downloading' | 'error'

function semverGt(a: string, b: string): boolean {
  const parse = (v: string) => v.split('.').map(Number)
  const [aMaj, aMin, aPat] = parse(a)
  const [bMaj, bMin, bPat] = parse(b)
  if (aMaj !== bMaj) return aMaj > bMaj
  if (aMin !== bMin) return aMin > bMin
  return aPat > bPat
}

async function fetchPack(url: string): Promise<OfficialSubjectPack> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json() as Record<string, unknown>
  return {
    id: data.id as string,
    version: data.version as string,
    downloadedAt: new Date().toISOString(),
    subject: data.subject as OfficialSubjectPack['subject'],
    topics: data.topics as OfficialSubjectPack['topics'],
    questions: data.questions as OfficialSubjectPack['questions'],
  }
}

export function SubjectsView() {
  const iconSize = useIconSize()
  const { navigate, setCurrentSubject } = useNavigationStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [installed, setInstalled] = useState<Record<string, OfficialSubjectPack>>({})
  const [uploadedPacks, setUploadedPacks] = useState<UploadedSubjectPack[]>([])
  const [dlState, setDlState] = useState<Record<string, DownloadState>>({})
  const [dlError, setDlError] = useState<Record<string, string>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    void officialPackRepository.getAll().then((packs) => {
      const map: Record<string, OfficialSubjectPack> = {}
      packs.forEach((p) => { map[p.id] = p })
      setInstalled(map)
    })
    void uploadedContentRepository.getAll().then(setUploadedPacks)
  }, [])

  async function handleDownload(entry: SubjectRegistryEntry) {
    setDlState((s) => ({ ...s, [entry.id]: 'downloading' }))
    setDlError((e) => { const n = { ...e }; delete n[entry.id]; return n })
    try {
      const pack = await fetchPack(entry.packUrl)
      await officialPackRepository.save(pack)
      deregisterOfficialPack(pack)
      registerOfficialPacks([pack])
      setInstalled((s) => ({ ...s, [entry.id]: pack }))
      setDlState((s) => ({ ...s, [entry.id]: 'idle' }))
    } catch (err) {
      setDlState((s) => ({ ...s, [entry.id]: 'error' }))
      setDlError((e) => ({ ...e, [entry.id]: err instanceof Error ? err.message : 'Download failed' }))
    }
  }

  async function handleRemove(entry: SubjectRegistryEntry) {
    const pack = installed[entry.id]
    if (!pack) return
    await officialPackRepository.delete(entry.id)
    deregisterOfficialPack(pack)
    setInstalled((s) => { const n = { ...s }; delete n[entry.id]; return n })
  }

  async function handleFile(file: File) {
    setUploadError(null)
    setImporting(true)
    try {
      const text = await file.text()
      const json = JSON.parse(text) as unknown
      const existingIds = questionRepository.getAllSubjects().map((s) => s.id)
      const pack = parseSubjectPack(json, existingIds)
      await uploadedContentRepository.save(pack)
      registerUploadedPacks([pack])
      setUploadedPacks((prev) => [...prev, pack])
    } catch (err) {
      if (err instanceof ImportError) setUploadError(err.message)
      else if (err instanceof SyntaxError) setUploadError('Invalid JSON file.')
      else setUploadError('Failed to import subject.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeleteUploaded(pack: UploadedSubjectPack) {
    await uploadedContentRepository.delete(pack.id)
    deregisterUploadedPack(pack)
    setUploadedPacks((prev) => prev.filter((p) => p.id !== pack.id))
  }

  function openSubject(id: string) {
    void setCurrentSubject(id)
    navigate({ name: 'topics', subjectId: id })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <div className="p-4 space-y-2">

        {/* Official subjects from registry */}
        {REGISTRY.subjects.map((entry) => {
          const pack = installed[entry.id]
          const isBundled = entry.bundled
          const isInstalled = isBundled || !!pack
          const hasUpdate = pack && semverGt(entry.version, pack.version)
          const state = dlState[entry.id] ?? 'idle'
          const err = dlError[entry.id]

          return (
            <div key={entry.id} className="flex items-stretch gap-2">
              <button
                onClick={() => isInstalled ? openSubject(entry.id) : undefined}
                disabled={!isInstalled}
                className={`flex-1 flex items-center justify-between p-4 bg-gray-900 border rounded-lg text-left transition-colors
                  ${isInstalled ? 'border-gray-800 hover:border-gray-600 cursor-pointer' : 'border-gray-800/50 opacity-60 cursor-default'}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-100">{entry.name}</p>
                    {isBundled && !pack && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-800/50 rounded">built-in</span>
                    )}
                    {pack && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 rounded">v{pack.version}</span>
                    )}
                    {hasUpdate && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-amber-900/40 text-amber-400 border border-amber-800/50 rounded">update available</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{entry.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{entry.questionCount} questions · {entry.topicCount} topics</p>
                  {pack && (
                    <p className="text-xs text-gray-700 mt-0.5">
                      Downloaded {new Date(pack.downloadedAt).toLocaleDateString()}
                    </p>
                  )}
                  {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
                </div>
                {isInstalled && <ChevronRight size={iconSize(18)} className="text-gray-600 shrink-0 ml-3" />}
              </button>

              <div className="flex flex-col gap-1">
                {/* Download or update button */}
                {!isBundled && !pack && (
                  <button
                    onClick={() => void handleDownload(entry)}
                    disabled={state === 'downloading'}
                    className="px-3 h-full bg-gray-900 border border-gray-800 rounded-lg text-blue-400 hover:text-blue-300 hover:border-blue-800 transition-colors disabled:opacity-50"
                    title="Download"
                  >
                    {state === 'downloading'
                      ? <RefreshCw size={iconSize(15)} className="animate-spin" />
                      : <Download size={iconSize(15)} />}
                  </button>
                )}
                {(pack || (isBundled && hasUpdate)) && (
                  <>
                    {hasUpdate && (
                      <button
                        onClick={() => void handleDownload(entry)}
                        disabled={state === 'downloading'}
                        className="px-3 py-2 bg-gray-900 border border-amber-900/50 rounded-lg text-amber-400 hover:border-amber-700 transition-colors disabled:opacity-50"
                        title="Update"
                      >
                        {state === 'downloading'
                          ? <RefreshCw size={iconSize(14)} className="animate-spin" />
                          : <RefreshCw size={iconSize(14)} />}
                      </button>
                    )}
                    {!isBundled && pack && (
                      <button
                        onClick={() => void handleRemove(entry)}
                        className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-600 hover:text-red-400 hover:border-red-900/50 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={iconSize(14)} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}

        {/* Uploaded custom subjects */}
        {uploadedPacks.map((pack) => (
          <div key={pack.id} className="flex items-stretch gap-2">
            <button
              onClick={() => openSubject(pack.subject.id)}
              className="flex-1 flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-100">{pack.subject.name}</p>
                  <span className="text-[0.6rem] px-1.5 py-0.5 bg-purple-900/40 text-purple-400 border border-purple-800/50 rounded">imported</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{pack.subject.description}</p>
                <p className="text-xs text-gray-600 mt-1">{questionRepository.countBySubject(pack.subject.id)} questions</p>
              </div>
              <ChevronRight size={iconSize(18)} className="text-gray-600 shrink-0 ml-3" />
            </button>
            <button
              onClick={() => void handleDeleteUploaded(pack)}
              className="px-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-600 hover:text-red-400 hover:border-red-900/50 transition-colors"
              aria-label={`Delete ${pack.subject.name}`}
            >
              <Trash2 size={iconSize(15)} />
            </button>
          </div>
        ))}

        {/* Upload error */}
        {uploadError && (
          <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400">
            <AlertCircle size={iconSize(13)} className="shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Divider + upload button */}
        <div className="pt-1 space-y-2">
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <Package size={iconSize(11)} /> Custom subject packs
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-700 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors disabled:opacity-50"
          >
            <Upload size={iconSize(14)} />
            {importing ? 'Importing…' : 'Upload Subject JSON'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
          }}
        />

        {/* Legend */}
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <CheckCircle size={iconSize(11)} className="text-emerald-700" /> downloaded
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Download size={iconSize(11)} className="text-blue-700" /> tap to download
          </span>
        </div>

      </div>
    </div>
  )
}
