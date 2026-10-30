import { useEffect, useState } from 'react'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { useNavigationStore } from '@/store'
import { progressTracker } from '@/core/progress-engine'
import { questionRepository } from '@/core/question-engine'
import { ScoreBar } from '@/components/common'
import type { SubjectStats, WeakArea } from '@/types'

export function DashboardView() {
  const { navigate } = useNavigationStore()
  const [stats, setStats] = useState<SubjectStats | null>(null)
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([])

  useEffect(() => {
    async function load() {
      const subjects = questionRepository.getAllSubjects()
      if (subjects.length === 0) return
      const [s, w] = await Promise.all([
        progressTracker.getSubjectStats(subjects[0].id),
        progressTracker.getWeakAreas(subjects[0].id),
      ])
      setStats(s)
      setWeakAreas(w)
    }
    void load()
  }, [])

  const subjects = questionRepository.getAllSubjects()

  return (
    <div className="p-4 space-y-5">
      {/* Stats */}
      {stats && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Overall Progress</h2>
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

      {/* Subjects */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subjects</h2>
        <div className="space-y-2">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate({ name: 'topics', subjectId: s.id })}
              className="w-full flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-gray-200">{s.name}</p>
                <p className="text-xs text-gray-500">{questionRepository.countBySubject(s.id)} questions</p>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          ))}
        </div>
      </section>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-400" /> Weak Areas
          </h2>
          <div className="space-y-2">
            {weakAreas.slice(0, 3).map((area) => (
              <div key={area.topicId} className="flex items-center justify-between p-3 bg-gray-900 border border-amber-900/30 rounded-lg">
                <p className="text-sm text-gray-300">{area.topicName}</p>
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
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
