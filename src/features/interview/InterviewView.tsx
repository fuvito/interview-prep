import { useNavigationStore, useInterviewStore } from '@/store'
import { MarkdownRenderer, DifficultyBadge, TypeBadge, ProgressBar, Button, EmptyState } from '@/components/common'
import type { Question } from '@/types'

export function InterviewView() {
  const { navigate } = useNavigationStore()
  const store = useInterviewStore()

  if (store.questions.length === 0) {
    return <EmptyState title="No session" message="Start a new interview from the Subjects screen." />
  }

  const question = store.questions[store.currentIndex]
  const isLast = store.currentIndex === store.questions.length - 1
  const answered = question.id in store.results
  const canSubmit = store.selectedAnswerIds.length > 0 && !answered

  const handleNext = async () => {
    const done = await store.advanceOrFinish()
    if (done) navigate({ name: 'results' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-800">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Question {store.currentIndex + 1} of {store.questions.length}</span>
          <span>{Object.keys(store.results).length} answered</span>
        </div>
        <ProgressBar current={store.currentIndex + 1} total={store.questions.length} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={question.difficulty} />
          <TypeBadge type={question.type} />
        </div>

        <MarkdownRenderer>{question.question}</MarkdownRenderer>
        {question.codeSnippet && (
          <MarkdownRenderer>{`\`\`\`typescript\n${question.codeSnippet}\n\`\`\``}</MarkdownRenderer>
        )}

        <InterviewOptions question={question} />

        {answered && (
          <p className="text-xs text-gray-500 italic">Answer recorded — explanations shown in results.</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800 flex gap-2 shrink-0">
        {!answered && (
          <Button onClick={store.submitAnswer} disabled={!canSubmit} className="flex-1">
            Submit Answer
          </Button>
        )}
        {answered && (
          <Button onClick={() => void handleNext()} className="flex-1">
            {isLast ? 'Finish Interview' : 'Next →'}
          </Button>
        )}
      </div>
    </div>
  )
}

function InterviewOptions({ question }: { question: Question }) {
  const store = useInterviewStore()
  const answered = question.id in store.results

  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const isSelected = store.selectedAnswerIds.includes(opt.id)
        let cls = 'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors '
        if (answered) {
          cls += isSelected
            ? 'border-blue-600 bg-blue-900/20 text-blue-200'
            : 'border-gray-800 bg-gray-900/50 text-gray-500'
        } else if (isSelected) {
          cls += 'border-blue-500 bg-blue-900/20 text-blue-200'
        } else {
          cls += 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
        }
        return (
          <button
            key={opt.id}
            className={cls}
            onClick={() => store.selectAnswer(opt.id)}
            disabled={answered}
          >
            <MarkdownRenderer inline>{opt.text}</MarkdownRenderer>
          </button>
        )
      })}
    </div>
  )
}
