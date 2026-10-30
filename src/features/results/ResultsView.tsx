import { useState } from 'react'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigationStore, useInterviewStore } from '@/store'
import { MarkdownRenderer, DifficultyBadge, ScoreBar, Button, EmptyState } from '@/components/common'
import { useIconSize } from '@/hooks/useIconSize'

export function ResultsView() {
  const iconSize = useIconSize()
  const { navigateRoot } = useNavigationStore()
  const store = useInterviewStore()
  const { completedSession, questions, results } = store
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!completedSession) {
    return <EmptyState title="No results" message="Complete an interview to see your results here." />
  }

  const score = completedSession.score
  const scoreColor = score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-blue-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
  const scoreLabel = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Needs Work' : 'Keep Practicing'

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {/* Score summary */}
        <div className="px-6 py-6 border-b border-gray-800 text-center space-y-3">
          <p className={`text-5xl font-bold ${scoreColor}`}>{score}%</p>
          <p className="text-gray-300 text-sm font-medium">{scoreLabel}</p>
          <ScoreBar score={score} />
          <div className="flex justify-center gap-6 text-sm pt-1">
            <span className="text-emerald-400"><strong>{completedSession.correctAnswers}</strong> correct</span>
            <span className="text-red-400"><strong>{completedSession.totalQuestions - completedSession.correctAnswers}</strong> incorrect</span>
          </div>
        </div>

        {/* Question review */}
        <div className="p-4 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Review</h2>
          {questions.map((q) => {
            const result = results[q.id]
            const isExpanded = expandedId === q.id
            const isCorrect = result?.isCorrect ?? false

            return (
              <div key={q.id} className={`border rounded-lg overflow-hidden ${isCorrect ? 'border-emerald-900/50' : 'border-red-900/50'}`}>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-900/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  {isCorrect
                    ? <CheckCircle size={iconSize(15)} className="text-emerald-400 shrink-0" />
                    : <XCircle size={iconSize(15)} className="text-red-400 shrink-0" />}
                  <span className="text-sm text-gray-200 flex-1 line-clamp-1">{q.question.replace(/`/g, '')}</span>
                  <DifficultyBadge difficulty={q.difficulty} />
                  {isExpanded ? <ChevronUp size={iconSize(14)} className="text-gray-400 shrink-0" /> : <ChevronDown size={iconSize(14)} className="text-gray-400 shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/30 space-y-3">
                    <MarkdownRenderer>{q.question}</MarkdownRenderer>
                    {q.codeSnippet && <MarkdownRenderer>{`\`\`\`typescript\n${q.codeSnippet}\n\`\`\``}</MarkdownRenderer>}
                    {!isCorrect && result && (
                      <div className="text-xs text-red-400 space-y-0.5">
                        <p>Your answer: {result.selectedAnswerIds.map((id) => q.options?.find((o) => o.id === id)?.text ?? id).join(', ')}</p>
                        <p className="text-emerald-400">Correct: {result.correctAnswerIds.map((id) => q.options?.find((o) => o.id === id)?.text ?? id).join(', ')}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Explanation</p>
                      <MarkdownRenderer>{q.explanation}</MarkdownRenderer>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-800 shrink-0">
        <Button variant="secondary" className="w-full" onClick={() => { store.reset(); navigateRoot({ name: 'subjects' }) }}>
          Done
        </Button>
      </div>
    </div>
  )
}
