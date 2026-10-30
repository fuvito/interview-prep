import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Upload, Trash2, AlertCircle } from 'lucide-react'
import { useNavigationStore } from '@/store'
import { questionRepository } from '@/core/question-engine'
import { uploadedContentRepository } from '@/database/repositories'
import { registerUploadedPacks, deregisterUploadedPack } from '@/content'
import { parseSubjectPack, ImportError } from '@/lib/subjectImporter'
import type { UploadedSubjectPack } from '@/types'

export function SubjectsView() {
  const { navigate } = useNavigationStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subjects, setSubjects] = useState(() => questionRepository.getAllSubjects())
  const [uploadedPacks, setUploadedPacks] = useState<UploadedSubjectPack[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const uploadedIds = new Set(uploadedPacks.map((p) => p.id))

  useEffect(() => {
    uploadedContentRepository.getAll().then(setUploadedPacks)
  }, [])

  async function handleFile(file: File) {
    setError(null)
    setImporting(true)
    try {
      const text = await file.text()
      const json = JSON.parse(text) as unknown
      const existingIds = questionRepository.getAllSubjects().map((s) => s.id)
      const pack = parseSubjectPack(json, existingIds)
      await uploadedContentRepository.save(pack)
      registerUploadedPacks([pack])
      setUploadedPacks((prev) => [...prev, pack])
      setSubjects(questionRepository.getAllSubjects())
    } catch (err) {
      if (err instanceof ImportError) {
        setError(err.message)
      } else if (err instanceof SyntaxError) {
        setError('Invalid JSON file.')
      } else {
        setError('Failed to import subject.')
      }
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(pack: UploadedSubjectPack) {
    await uploadedContentRepository.delete(pack.id)
    deregisterUploadedPack(pack)
    setUploadedPacks((prev) => prev.filter((p) => p.id !== pack.id))
    setUploadedIds((prev) => {
      const next = new Set(prev)
      next.delete(pack.id)
      return next
    })
    setSubjects(questionRepository.getAllSubjects())
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {subjects.map((s) => {
          const isUploaded = uploadedIds.has(s.id)
          const pack = uploadedPacks.find((p) => p.id === s.id)
          return (
            <div key={s.id} className="flex items-stretch gap-2">
              <button
                onClick={() => navigate({ name: 'topics', subjectId: s.id })}
                className="flex-1 flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-100">{s.name}</p>
                    {isUploaded && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-800/50 rounded">
                        imported
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {questionRepository.countBySubject(s.id)} questions
                  </p>
                </div>
                <ChevronRight size={18} className="text-gray-600 shrink-0 ml-3" />
              </button>
              {isUploaded && pack && (
                <button
                  onClick={() => void handleDelete(pack)}
                  className="px-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-600 hover:text-red-400 hover:border-red-900/50 transition-colors"
                  aria-label={`Delete ${s.name}`}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          )
        })}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-700 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors disabled:opacity-50"
        >
          <Upload size={14} />
          {importing ? 'Importing…' : 'Upload Subject JSON'}
        </button>

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
      </div>
    </div>
  )
}
