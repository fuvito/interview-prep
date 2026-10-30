import { useEffect, useState } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { progressTracker } from '@/core/progress-engine'
import { questionRepository } from '@/core/question-engine'
import { ScoreBar, ProgressBar, Button } from '@/components/common'
import type { SubjectStats } from '@/types'

export function ProgressView() {
  const [stats, setStats] = useState<SubjectStats | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  function loadStats() {
    const subjects = questionRepository.getAllSubjects()
    if (subjects.length === 0) return
    void progressTracker.getSubjectStats(subjects[0].id).then(setStats)
  }

  useEffect(() => { loadStats() }, [])

  async function handleReset() {
    setResetting(true)
    await progressTracker.resetAllProgress()
    setResetting(false)
    setShowConfirm(false)
    loadStats()
  }

  if (!stats) return <div className="p-4 text-gray-400 text-sm">Loading...</div>

  const hasActivity = stats.totalAttempts > 0

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">
        {/* Overall */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Overall</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-blue-400">{stats.score}%</p>
                <p className="text-xs text-gray-400 mt-0.5">Correct rate</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-200">{stats.attemptedQuestions} <span className="text-gray-400">/ {stats.totalQuestions}</span></p>
                <p className="text-xs text-gray-400">questions attempted</p>
              </div>
            </div>
            <ScoreBar score={stats.score} />
            {hasActivity && (
              <div className="flex gap-4 text-xs pt-1">
                <span className="text-emerald-400">{stats.correctAttempts} correct</span>
                <span className="text-red-400">{stats.totalAttempts - stats.correctAttempts} incorrect</span>
                <span className="text-gray-400">{stats.totalAttempts} total attempts</span>
              </div>
            )}
          </div>
        </section>

        {/* Per topic */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">By Topic</h2>
          <div className="space-y-2">
            {stats.topicStats.map((ts) => {
              const topic = questionRepository.getTopicById(ts.topicId)
              const attempted = ts.correctAttempts + ts.incorrectAttempts
              const rate = attempted > 0 ? Math.round((ts.correctAttempts / attempted) * 100) : null

              return (
                <div key={ts.topicId} className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-200">{topic?.name ?? ts.topicId}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{ts.attemptedQuestions}/{ts.totalQuestions}</span>
                      {rate !== null && (
                        <span className={rate >= 75 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-red-400'}>
                          {rate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <ProgressBar current={ts.attemptedQuestions} total={ts.totalQuestions} />
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Reset footer */}
      <div className="px-4 py-3 border-t border-gray-800 shrink-0">
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          <RotateCcw size={12} />
          Reset all progress
        </button>
      </div>

      {/* Confirmation dialog overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-10">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-xs space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-100">Reset all progress?</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  This will permanently delete all question attempts and interview sessions. Bookmarks will not be affected.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => void handleReset()}
                disabled={resetting}
              >
                {resetting ? 'Resetting…' : 'Reset'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
