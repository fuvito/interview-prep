import { useEffect, useState } from 'react'
import { progressTracker } from '@/core/progress-engine'
import { questionRepository } from '@/core/question-engine'
import { ScoreBar, ProgressBar } from '@/components/common'
import type { SubjectStats } from '@/types'

export function ProgressView() {
  const [stats, setStats] = useState<SubjectStats | null>(null)

  useEffect(() => {
    const subjects = questionRepository.getAllSubjects()
    if (subjects.length === 0) return
    void progressTracker.getSubjectStats(subjects[0].id).then(setStats)
  }, [])

  if (!stats) return <div className="p-4 text-gray-500 text-sm">Loading...</div>

  const hasActivity = stats.totalAttempts > 0

  return (
    <div className="p-4 space-y-5">
      {/* Overall */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Overall</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-bold text-blue-400">{stats.score}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Correct rate</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-300">{stats.attemptedQuestions} <span className="text-gray-500">/ {stats.totalQuestions}</span></p>
              <p className="text-xs text-gray-500">questions attempted</p>
            </div>
          </div>
          <ScoreBar score={stats.score} />
          {hasActivity && (
            <div className="flex gap-4 text-xs pt-1">
              <span className="text-emerald-400">{stats.correctAttempts} correct</span>
              <span className="text-red-400">{stats.totalAttempts - stats.correctAttempts} incorrect</span>
              <span className="text-gray-500">{stats.totalAttempts} total attempts</span>
            </div>
          )}
        </div>
      </section>

      {/* Per topic */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">By Topic</h2>
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
                    <span className="text-gray-500">{ts.attemptedQuestions}/{ts.totalQuestions}</span>
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
  )
}
