import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Upload, Trash2, AlertCircle, Download, RefreshCw, CheckCircle, Package, Info, X, Copy, Check } from 'lucide-react'
import { useNavigationStore } from '@/store'
import { useIconSize } from '@/hooks/useIconSize'
import { questionRepository } from '@/core/question-engine'
import { uploadedContentRepository, officialPackRepository } from '@/database/repositories'
import { registerUploadedPacks, deregisterUploadedPack, registerOfficialPacks, deregisterOfficialPack } from '@/content'
import { parseSubjectPack, ImportError } from '@/lib/subjectImporter'
import { Button } from '@/components/common'
import type { SubjectRegistryEntry, OfficialSubjectPack, UploadedSubjectPack } from '@/types'
import registryData from '../../../public/registry.json'

const REGISTRY = registryData as { subjects: SubjectRegistryEntry[] }

type DownloadState = 'idle' | 'downloading' | 'error'

interface ManualDialog {
  entry: SubjectRegistryEntry
  error?: string
}

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

function ManualDownloadDialog({
  dialog,
  onClose,
  onUploadClick,
}: {
  dialog: ManualDialog
  onClose: () => void
  onUploadClick: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copyUrl() {
    void navigator.clipboard.writeText(dialog.entry.packUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800 shrink-0">
          <p className="text-sm font-semibold text-gray-100">
            {dialog.error ? 'Download Failed' : 'Manual Download'}
          </p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 space-y-4 text-sm">

          {dialog.error && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-400">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{dialog.error}</span>
            </div>
          )}

          <p className="text-gray-300 leading-relaxed">
            {dialog.error
              ? `Automatic download of ${dialog.entry.name} failed, likely due to network restrictions. You can download the file manually and add it here.`
              : `If automatic download is blocked (e.g. by a corporate firewall or proxy), you can download the ${dialog.entry.name} pack manually.`}
          </p>

          {/* URL */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pack URL</p>
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <span className="text-xs text-blue-300 break-all flex-1 select-all leading-relaxed">
                {dialog.entry.packUrl}
              </span>
              <button
                onClick={copyUrl}
                className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors ml-1"
                title="Copy URL"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">How to install manually</p>
            <ol className="space-y-2 text-xs text-gray-400 leading-relaxed">
              <li className="flex gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                <span>Open the URL above in a browser tab. The JSON file will download or display as text.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                <span>Save the file to your computer (right-click → Save as, or use the browser's download).</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                <span>Return here and tap <strong className="text-gray-200">Upload Subject JSON</strong> at the bottom of this screen to load the file.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-3 border-t border-gray-800 flex gap-2 shrink-0">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" className="flex-1" onClick={() => { onClose(); onUploadClick() }}>
            Upload JSON
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SubjectsView() {
  const iconSize = useIconSize()
  const { navigate, setCurrentSubject } = useNavigationStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [installed, setInstalled] = useState<Record<string, OfficialSubjectPack>>({})
  const [uploadedPacks, setUploadedPacks] = useState<UploadedSubjectPack[]>([])
  const [dlState, setDlState] = useState<Record<string, DownloadState>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [manualDialog, setManualDialog] = useState<ManualDialog | null>(null)

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
    try {
      const pack = await fetchPack(entry.packUrl)
      await officialPackRepository.save(pack)
      deregisterOfficialPack(pack)
      registerOfficialPacks([pack])
      setInstalled((s) => ({ ...s, [entry.id]: pack }))
      setDlState((s) => ({ ...s, [entry.id]: 'idle' }))
    } catch (err) {
      setDlState((s) => ({ ...s, [entry.id]: 'error' }))
      setManualDialog({ entry, error: err instanceof Error ? err.message : 'Download failed' })
    }
  }

  async function handleRemove(entry: SubjectRegistryEntry) {
    const pack = installed[entry.id]
    if (!pack) return
    await officialPackRepository.delete(entry.id)
    deregisterOfficialPack(pack)
    setInstalled((s) => { const n = { ...s }; delete n[entry.id]; return n })
    setDlState((s) => { const n = { ...s }; delete n[entry.id]; return n })
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

  function triggerUpload() {
    fileInputRef.current?.click()
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
          const hasFailed = state === 'error'

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
                    {hasFailed && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 bg-red-900/40 text-red-400 border border-red-800/50 rounded">download failed</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{entry.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{entry.questionCount} questions · {entry.topicCount} topics</p>
                  {pack && (
                    <p className="text-xs text-gray-700 mt-0.5">
                      Downloaded {new Date(pack.downloadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {isInstalled && <ChevronRight size={iconSize(18)} className="text-gray-600 shrink-0 ml-3" />}
              </button>

              <div className="flex flex-col gap-1">
                {/* Download button (not yet installed) */}
                {!isBundled && !pack && (
                  <>
                    <button
                      onClick={() => void handleDownload(entry)}
                      disabled={state === 'downloading'}
                      className={`px-3 flex-1 bg-gray-900 border rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center
                        ${hasFailed ? 'border-red-900/50 text-red-400 hover:border-red-700' : 'border-gray-800 text-blue-400 hover:text-blue-300 hover:border-blue-800'}`}
                      title={hasFailed ? 'Retry download' : 'Download'}
                    >
                      {state === 'downloading'
                        ? <RefreshCw size={iconSize(15)} className="animate-spin" />
                        : <Download size={iconSize(15)} />}
                    </button>
                    <button
                      onClick={() => setManualDialog({ entry })}
                      className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors flex items-center justify-center"
                      title="Manual download instructions"
                    >
                      <Info size={iconSize(13)} />
                    </button>
                  </>
                )}

                {/* Update / remove buttons (already installed) */}
                {(pack || (isBundled && hasUpdate)) && (
                  <>
                    {hasUpdate && (
                      <button
                        onClick={() => void handleDownload(entry)}
                        disabled={state === 'downloading'}
                        className="px-3 py-2 bg-gray-900 border border-amber-900/50 rounded-lg text-amber-400 hover:border-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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
                        className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-600 hover:text-red-400 hover:border-red-900/50 transition-colors flex items-center justify-center"
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

        {/* Upload button */}
        <div className="pt-1 space-y-2">
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <Package size={iconSize(11)} /> Custom subject packs
          </p>
          <button
            onClick={triggerUpload}
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

      {/* Manual download dialog */}
      {manualDialog && (
        <ManualDownloadDialog
          dialog={manualDialog}
          onClose={() => setManualDialog(null)}
          onUploadClick={triggerUpload}
        />
      )}
    </div>
  )
}
