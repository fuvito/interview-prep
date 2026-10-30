import { useEffect, useState } from 'react'
import { BookOpen, Zap } from 'lucide-react'
import { useNavigationStore } from '@/store'
import { questionRepository } from '@/core/question-engine'
import { progressTracker } from '@/core/progress-engine'
import { ProgressBar, Button } from '@/components/common'
import type { TopicStats } from '@/types'

interface Props { subjectId: string }

export function TopicsView({ subjectId }: Props) {
  const { navigate } = useNavigationStore()
  const topics = questionRepository.getTopicsBySubject(subjectId)
  const [statsMap, setStatsMap] = useState<Record<string, TopicStats>>({})

  useEffect(() => {
    async function load() {
      const all = await Promise.all(topics.map((t) => progressTracker.getTopicStats(t.id)))
      const map: Record<string, TopicStats> = {}
      all.forEach((s) => { map[s.topicId] = s })
      setStatsMap(map)
    }
    void load()
  }, [subjectId])

  return (
    <div className="p-4 space-y-2">
      {/* Interview Mode shortcut */}
      <button
        onClick={() => navigate({ name: 'interview-setup', subjectId })}
        className="w-full flex items-center justify-between p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg hover:bg-blue-900/30 transition-colors text-left mb-4"
      >
        <div>
          <p className="text-sm font-medium text-blue-300">Practice Interview</p>
          <p className="text-xs text-blue-400/70">Timed quiz with score tracking</p>
        </div>
        <Zap size={16} className="text-blue-400 shrink-0" />
      </button>

      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1">Topics</h2>

      {topics.map((topic) => {
        const stats = statsMap[topic.id]
        const pct = stats ? Math.round(stats.completionRate * 100) : 0
        const correctRate = stats && stats.correctAttempts + stats.incorrectAttempts > 0
          ? Math.round((stats.correctAttempts / (stats.correctAttempts + stats.incorrectAttempts)) * 100)
          : null

        return (
          <div key={topic.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{topic.name}</p>
                <p className="text-xs text-gray-400">{questionRepository.countByTopic(topic.id)} questions</p>
              </div>
              {correctRate !== null && (
                <span className={`text-xs font-mono shrink-0 ${correctRate >= 75 ? 'text-emerald-400' : correctRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {correctRate}%
                </span>
              )}
            </div>
            <ProgressBar current={pct} total={100} />
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate({ name: 'learning', subjectId, topicId: topic.id })}
              >
                <BookOpen size={13} /> Study
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
