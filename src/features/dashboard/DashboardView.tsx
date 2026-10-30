import { useEffect, useState } from 'react'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { useNavigationStore } from '@/store'
import { progressTracker } from '@/core/progress-engine'
import { questionRepository } from '@/core/question-engine'
import { ScoreBar } from '@/components/common'
import { useIconSize } from '@/hooks/useIconSize'
import type { SubjectStats, WeakArea } from '@/types'

export function DashboardView() {
  const iconSize = useIconSize()
  const { navigate, currentSubjectId, setCurrentSubject } = useNavigationStore()
  const [stats, setStats] = useState<SubjectStats | null>(null)
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([])

  const subjects = questionRepository.getAllSubjects()
  const subject = currentSubjectId ? questionRepository.getSubjectById(currentSubjectId) : null

  useEffect(() => {
    if (!currentSubjectId) return
    async function load() {
      const [s, w] = await Promise.all([
        progressTracker.getSubjectStats(currentSubjectId!),
        progressTracker.getWeakAreas(currentSubjectId!),
      ])
      setStats(s)
      setWeakAreas(w)
    }
    void load()
  }, [currentSubjectId])

  // First launch — no subject selected yet
  if (!subject) {
    return (
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <p className="text-sm text-gray-400 mb-4">Choose a subject to get started:</p>
          <div className="space-y-2">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  void setCurrentSubject(s.id)
                  navigate({ name: 'topics', subjectId: s.id })
                }}
                className="w-full flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-blue-700 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-gray-100">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{questionRepository.countBySubject(s.id)} questions</p>
                </div>
                <ChevronRight size={iconSize(16)} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const topics = questionRepository.getTopicsBySubject(currentSubjectId!)

  return (
    <div className="p-4 space-y-5">
      {/* Progress stats for current subject */}
      {stats && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Progress</h2>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Questions" value={stats.totalQuestions} />
            <StatCard label="Attempted" value={stats.attemptedQuestions} />
            <StatCard label="Score" value={`${stats.score}%`} highlight />
          </div>
          <div className="mt-3">
            <ScoreBar score={stats.score} />
          </div>
        </section>
      )}

      {/* Topics for current subject */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Topics</h2>
        <div className="space-y-2">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate({ name: 'learning', subjectId: currentSubjectId!, topicId: t.id })}
              className="w-full flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-gray-200">{t.name}</p>
                <p className="text-xs text-gray-500">{questionRepository.countByTopic(t.id)} questions</p>
              </div>
              <ChevronRight size={iconSize(16)} className="text-gray-400" />
            </button>
          ))}
        </div>
      </section>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle size={iconSize(12)} className="text-amber-400" /> Weak Areas
          </h2>
          <div className="space-y-2">
            {weakAreas.slice(0, 3).map((area) => (
              <div key={area.topicId} className="flex items-center justify-between p-3 bg-gray-900 border border-amber-900/30 rounded-lg">
                <p className="text-sm text-gray-200">{area.topicName}</p>
                <span className="text-xs text-amber-400 font-mono">{Math.round(area.correctRate * 100)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
      <p className={`text-xl font-bold ${highlight ? 'text-blue-400' : 'text-gray-100'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
