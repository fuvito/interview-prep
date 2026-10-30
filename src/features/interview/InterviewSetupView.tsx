import { useState } from 'react'
import { useNavigationStore, useInterviewStore } from '@/store'
import { questionRepository } from '@/core/question-engine'
import { Button } from '@/components/common'

interface Props { subjectId: string }

const COUNTS = [5, 10, 15, 20]

export function InterviewSetupView({ subjectId }: Props) {
  const { navigate } = useNavigationStore()
  const interviewStore = useInterviewStore()
  const topics = questionRepository.getTopicsBySubject(subjectId)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [count, setCount] = useState(10)

  const toggleTopic = (id: string) =>
    setSelectedTopics((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])

  const available = (() => {
    const pool = selectedTopics.length > 0
      ? questionRepository.getBySubject(subjectId).filter((q) => selectedTopics.includes(q.topicId))
      : questionRepository.getBySubject(subjectId)
    return pool.filter((q) => q.type !== 'text').length
  })()

  const handleStart = () => {
    interviewStore.start(subjectId, selectedTopics, count)
    navigate({ name: 'interview' })
  }

  return (
    <div className="p-4 space-y-5">
      {/* Topics */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Topics</h2>
        <p className="text-xs text-gray-500 mb-2">Leave all unchecked to include all topics.</p>
        <div className="space-y-1.5">
          {topics.map((t) => (
            <label key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTopics.includes(t.id)}
                onChange={() => toggleTopic(t.id)}
                className="accent-blue-500 w-4 h-4"
              />
              <span className="text-sm text-gray-300">{t.name}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Question count */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Questions</h2>
        <div className="flex gap-2">
          {COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                ${count === n
                  ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'}`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{available} questions available for selection.</p>
      </section>

      <Button
        onClick={handleStart}
        disabled={available === 0}
        className="w-full"
      >
        Start Interview ({Math.min(count, available)} questions)
      </Button>
    </div>
  )
}
