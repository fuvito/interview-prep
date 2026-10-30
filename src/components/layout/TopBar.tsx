import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useNavigationStore, useThemeStore } from '@/store'
import { questionRepository } from '@/core/question-engine'
import type { View } from '@/store'

function getTitle(view: View): string {
  switch (view.name) {
    case 'dashboard':      return 'InterviewPrep'
    case 'subjects':       return 'Subjects'
    case 'topics':         return questionRepository.getSubjectById(view.subjectId)?.name ?? 'Topics'
    case 'learning':       return questionRepository.getTopicById(view.topicId)?.name ?? 'Study'
    case 'interview-setup': return 'Interview Setup'
    case 'interview':      return 'Interview'
    case 'results':        return 'Results'
    case 'progress':       return 'Progress'
    case 'bookmarks':      return 'Bookmarks'
  }
}

export function TopBar() {
  const { current, stack, goBack } = useNavigationStore()
  const { theme, toggle } = useThemeStore()
  const canGoBack = stack.length > 0
  const isDashboard = current.name === 'dashboard'

  return (
    <header className="h-12 flex items-center px-4 border-b border-gray-800 shrink-0 gap-3">
      {canGoBack ? (
        <button
          onClick={goBack}
          className="text-gray-400 hover:text-gray-200 transition-colors p-0.5 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <div className="w-5 shrink-0" />
      )}

      {isDashboard ? (
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">IP</span>
          <span className="text-xs text-gray-500 font-medium">InterviewPrep</span>
        </div>
      ) : (
        <h1 className="text-sm font-semibold text-gray-100 truncate">{getTitle(current)}</h1>
      )}

      <button
        onClick={() => void toggle()}
        className="ml-auto text-gray-500 hover:text-gray-300 transition-colors p-0.5 shrink-0"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </header>
  )
}
