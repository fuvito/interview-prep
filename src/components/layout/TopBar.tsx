import { ArrowLeft, Sun, Moon, Info, Maximize2 } from 'lucide-react'
import { useNavigationStore, useThemeStore } from '@/store'
import { questionRepository } from '@/core/question-engine'
import type { View } from '@/store'

const isPopup = window.innerWidth <= 500

function getTitle(view: View, currentSubjectId: string | null): string {
  switch (view.name) {
    case 'dashboard': {
      const subject = currentSubjectId ? questionRepository.getSubjectById(currentSubjectId) : null
      return subject?.name ?? 'InterviewPrep'
    }
    case 'subjects':        return 'Subjects'
    case 'topics':          return questionRepository.getSubjectById(view.subjectId)?.name ?? 'Topics'
    case 'learning':        return questionRepository.getTopicById(view.topicId)?.name ?? 'Study'
    case 'interview-setup': return questionRepository.getSubjectById(view.subjectId)?.name ?? 'Interview Setup'
    case 'interview':       return 'Interview'
    case 'results':         return 'Results'
    case 'progress':        return 'Progress'
    case 'bookmarks':       return 'Bookmarks'
    case 'about':           return 'About'
  }
}

export function TopBar() {
  const { current, stack, navigate, goBack, currentSubjectId } = useNavigationStore()
  const { theme, toggle, fontSize, increaseFontSize, decreaseFontSize } = useThemeStore()
  const canGoBack = stack.length > 0
  const isDashboard = current.name === 'dashboard'
  const hasSubject = isDashboard && currentSubjectId !== null

  function openFullTab() {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
  }

  const title = getTitle(current, currentSubjectId)

  return (
    <header className="h-12 flex items-center px-4 border-b border-blue-900/40 bg-[#0c1628] shrink-0 gap-3">
      {canGoBack ? (
        <button
          onClick={goBack}
          className="text-blue-300/70 hover:text-blue-200 transition-colors p-0.5 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <div className="w-5 shrink-0" />
      )}

      {isDashboard && !hasSubject ? (
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">IP</span>
          <span className="text-xs text-blue-300/50 font-medium">InterviewPrep</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          {isDashboard && (
            <span className="text-[10px] font-bold tracking-widest text-blue-500 uppercase shrink-0">IP</span>
          )}
          <h1 className="text-sm font-semibold text-blue-100 truncate">{title}</h1>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1 shrink-0">
        {isDashboard && (
          <button
            onClick={() => navigate({ name: 'about' })}
            className="text-blue-400/50 hover:text-blue-300 transition-colors p-0.5"
            aria-label="About"
          >
            <Info size={15} />
          </button>
        )}

        <button
          onClick={() => void decreaseFontSize()}
          disabled={fontSize === 'xs'}
          className="text-blue-400/50 hover:text-blue-300 transition-colors px-0.5 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
          aria-label="Decrease font size"
        >
          <span className="font-bold select-none" style={{ fontSize: '10px' }}>A</span>
        </button>
        <button
          onClick={() => void increaseFontSize()}
          disabled={fontSize === 'lg'}
          className="text-blue-400/50 hover:text-blue-300 transition-colors px-0.5 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
          aria-label="Increase font size"
        >
          <span className="font-bold select-none" style={{ fontSize: '14px' }}>A</span>
        </button>

        <button
          onClick={() => void toggle()}
          className="text-blue-400/50 hover:text-blue-300 transition-colors p-0.5"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {isPopup && (
          <button
            onClick={openFullTab}
            className="text-blue-400/50 hover:text-blue-300 transition-colors p-0.5"
            aria-label="Open in full window"
          >
            <Maximize2 size={14} />
          </button>
        )}
      </div>
    </header>
  )
}
