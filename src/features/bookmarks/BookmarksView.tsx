import { useEffect, useState } from 'react'
import { BookmarkX, ChevronDown, ChevronUp } from 'lucide-react'
import { bookmarkEngine } from '@/core/progress-engine'
import { MarkdownRenderer, DifficultyBadge, TypeBadge, EmptyState } from '@/components/common'
import type { Question } from '@/types'

export function BookmarksView() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = () => void bookmarkEngine.getBookmarkedQuestions().then(setQuestions)

  useEffect(() => { load() }, [])

  const removeBookmark = async (questionId: string) => {
    await bookmarkEngine.toggle(questionId)
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    if (expandedId === questionId) setExpandedId(null)
  }

  if (questions.length === 0) {
    return <EmptyState title="No bookmarks" message="Bookmark questions while studying to find them here." />
  }

  return (
    <div className="p-4 space-y-2">
      <p className="text-xs text-gray-500 mb-3">{questions.length} bookmarked</p>
      {questions.map((q) => {
        const isExpanded = expandedId === q.id
        return (
          <div key={q.id} className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                className="flex-1 text-left flex items-start gap-2 min-w-0"
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
              >
                <span className="text-sm text-gray-300 flex-1 line-clamp-2 leading-snug">{q.question.replace(/```[\s\S]*?```/g, '[code]').replace(/`/g, '')}</span>
                {isExpanded ? <ChevronUp size={14} className="text-gray-500 shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-gray-500 shrink-0 mt-0.5" />}
              </button>
              <button
                onClick={() => void removeBookmark(q.id)}
                className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                title="Remove bookmark"
              >
                <BookmarkX size={15} />
              </button>
            </div>

            {isExpanded && (
              <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/40 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <TypeBadge type={q.type} />
                </div>
                <MarkdownRenderer>{q.question}</MarkdownRenderer>
                {q.codeSnippet && <MarkdownRenderer>{`\`\`\`typescript\n${q.codeSnippet}\n\`\`\``}</MarkdownRenderer>}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Explanation</p>
                  <MarkdownRenderer>{q.explanation}</MarkdownRenderer>
                </div>
                {q.keyConcepts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {q.keyConcepts.map((k) => (
                      <span key={k} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">{k}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
