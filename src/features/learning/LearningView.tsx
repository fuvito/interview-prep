import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck, CheckCircle, XCircle } from 'lucide-react'
import { useNavigationStore, useLearningStore } from '@/store'
import { bookmarkEngine } from '@/core/progress-engine'
import { MarkdownRenderer, DifficultyBadge, TypeBadge, ProgressBar, Button, EmptyState } from '@/components/common'
import type { EvaluationResult, Question } from '@/types'
import type { View } from '@/store'

export function LearningView() {
  const { current } = useNavigationStore()
  const view = current as Extract<View, { name: 'learning' }>
  const store = useLearningStore()

  useEffect(() => {
    store.load(view.subjectId, view.topicId)
    return () => store.reset()
  }, [view.subjectId, view.topicId])

  if (store.questions.length === 0) {
    return <EmptyState title="No questions" message="No questions available for this topic." />
  }

  const question = store.questions[store.currentIndex]
  const isLast = store.currentIndex === store.questions.length - 1
  const isFirst = store.currentIndex === 0
  const isChoice = question.type !== 'text'
  const canSubmit = store.selectedAnswerIds.length > 0 && store.phase === 'answering'

  return (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="px-4 py-2.5 border-b border-gray-800">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{store.currentIndex + 1} / {store.questions.length}</span>
          <span>{Math.round((store.currentIndex / store.questions.length) * 100)}%</span>
        </div>
        <ProgressBar current={store.currentIndex + 1} total={store.questions.length} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {/* Metadata row */}
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={question.difficulty} />
          <TypeBadge type={question.type} />
          {question.commonInterviewQuestion && (
            <span className="text-xs px-2 py-0.5 rounded border border-amber-800 bg-amber-900/20 text-amber-400">Common</span>
          )}
          <BookmarkButton questionId={question.id} />
        </div>

        {/* Question */}
        <MarkdownRenderer>{question.question}</MarkdownRenderer>
        {question.codeSnippet && (
          <MarkdownRenderer>{`\`\`\`typescript\n${question.codeSnippet}\n\`\`\``}</MarkdownRenderer>
        )}

        {/* Answer area */}
        {isChoice ? (
          <ChoiceOptions question={question} />
        ) : (
          store.phase === 'answering' && (
            <textarea
              value={store.textInput}
              onChange={(e) => store.setTextInput(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 placeholder:text-gray-500 resize-none h-28 focus:outline-none focus:border-blue-500 text-sm"
            />
          )
        )}

        {/* Explanation (after reveal) */}
        {store.phase === 'revealed' && (
          <ExplanationBlock question={question} result={store.evaluationResult} />
        )}
      </div>

      {/* Footer navigation */}
      <div className="px-4 py-3 border-t border-gray-800 flex gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={store.previous} disabled={isFirst} className="flex-1">
          ← Prev
        </Button>

        {store.phase === 'answering' && isChoice && (
          <Button size="sm" onClick={store.submitAnswer} disabled={!canSubmit} className="flex-1">
            Submit
          </Button>
        )}
        {store.phase === 'answering' && !isChoice && (
          <Button size="sm" onClick={store.revealAnswer} className="flex-1">
            Reveal Answer
          </Button>
        )}

        <Button
          variant={store.phase === 'revealed' ? 'primary' : 'ghost'}
          size="sm"
          onClick={store.next}
          disabled={isLast}
          className="flex-1"
        >
          Next →
        </Button>
      </div>
    </div>
  )
}

function BookmarkButton({ questionId }: { questionId: string }) {
  const [bookmarked, setBookmarked] = useState(false)
  useEffect(() => {
    void bookmarkEngine.isBookmarked(questionId).then(setBookmarked)
  }, [questionId])

  const toggle = async () => {
    const next = await bookmarkEngine.toggle(questionId)
    setBookmarked(next)
  }

  return (
    <button onClick={() => void toggle()} className="ml-auto text-gray-400 hover:text-amber-400 transition-colors" title="Bookmark">
      {bookmarked ? <BookmarkCheck size={16} className="text-amber-400" /> : <Bookmark size={16} />}
    </button>
  )
}

function ChoiceOptions({ question }: { question: Question }) {
  const store = useLearningStore()
  const correctSet = new Set(question.correctAnswers ?? [])

  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const isSelected = store.selectedAnswerIds.includes(opt.id)
        const isCorrect = correctSet.has(opt.id)
        const revealed = store.phase === 'revealed'

        let cls = 'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors '
        if (revealed) {
          if (isCorrect) cls += 'border-emerald-600 bg-emerald-900/20 text-emerald-300'
          else if (isSelected) cls += 'border-red-600 bg-red-900/20 text-red-300'
          else cls += 'border-gray-800 bg-gray-900/50 text-gray-400'
        } else if (isSelected) {
          cls += 'border-blue-500 bg-blue-900/20 text-blue-100'
        } else {
          cls += 'border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500'
        }

        return (
          <button
            key={opt.id}
            className={cls}
            onClick={() => store.selectAnswer(opt.id)}
            disabled={revealed}
          >
            <MarkdownRenderer inline>{opt.text}</MarkdownRenderer>
          </button>
        )
      })}
    </div>
  )
}

function ExplanationBlock({ question, result }: { question: Question; result: EvaluationResult | null }) {
  const store = useLearningStore()
  return (
    <div className="border border-gray-700 rounded-lg p-4 space-y-3 bg-gray-900/50">
      {/* Result indicator for choice questions */}
      {result && question.type !== 'text' && (
        <div className={`flex items-center gap-2 font-medium text-sm ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.isCorrect
            ? <><CheckCircle size={16} /> Correct</>
            : <><XCircle size={16} /> Incorrect</>}
        </div>
      )}

      {/* Explanation */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Explanation</p>
        <MarkdownRenderer>{question.explanation}</MarkdownRenderer>
      </div>

      {question.codeExample && (
        <MarkdownRenderer>{`\`\`\`typescript\n${question.codeExample}\n\`\`\``}</MarkdownRenderer>
      )}

      {question.keyConcepts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {question.keyConcepts.map((k) => (
            <span key={k} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">{k}</span>
          ))}
        </div>
      )}

      {/* Self-assess for text questions */}
      {question.type === 'text' && !result && (
        <div className="flex gap-2 pt-1">
          <Button variant="success" size="sm" className="flex-1" onClick={() => store.selfAssess('correct')}>
            <CheckCircle size={13} /> I knew this
          </Button>
          <Button variant="danger" size="sm" className="flex-1" onClick={() => store.selfAssess('incorrect')}>
            <XCircle size={13} /> Didn't know
          </Button>
        </div>
      )}
      {question.type === 'text' && result && (
        <p className={`text-sm font-medium ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.isCorrect ? '✓ Marked as known' : '✗ Marked for review'}
        </p>
      )}
    </div>
  )
}
