import { ArrowLeft, Sun, Moon, Info, Maximize2 } from 'lucide-react'
import { useNavigationStore, useThemeStore } from '@/store'
import { questionRepository } from '@/core/question-engine'
import type { View } from '@/store'

const isPopup = window.innerWidth <= 500

function getTitle(view: View): string {
  switch (view.name) {
    case 'dashboard':       return 'InterviewPrep'
    case 'subjects':        return 'Subjects'
    case 'topics':          return questionRepository.getSubjectById(view.subjectId)?.name ?? 'Topics'
    case 'learning':        return questionRepository.getTopicById(view.topicId)?.name ?? 'Study'
    case 'interview-setup': return 'Interview Setup'
    case 'interview':       return 'Interview'
    case 'results':         return 'Results'
    case 'progress':        return 'Progress'
    case 'bookmarks':       return 'Bookmarks'
    case 'about':           return 'About'
  }
}

export function TopBar() {
  const { current, stack, navigate, goBack } = useNavigationStore()
  const { theme, toggle, fontSize, increaseFontSize, decreaseFontSize } = useThemeStore()
  const canGoBack = stack.length > 0
  const isDashboard = current.name === 'dashboard'

  function openFullTab() {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
  }

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

      <div className="ml-auto flex items-center gap-1 shrink-0">
        {isDashboard && (
          <button
            onClick={() => navigate({ name: 'about' })}
            className="text-gray-500 hover:text-gray-300 transition-colors p-0.5"
            aria-label="About"
          >
            <Info size={15} />
          </button>
        )}

        <button
          onClick={() => void decreaseFontSize()}
          disabled={fontSize === 'sm'}
          className="text-gray-500 hover:text-gray-300 transition-colors px-0.5 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
          aria-label="Decrease font size"
        >
          <span className="font-bold select-none" style={{ fontSize: '10px' }}>A</span>
        </button>
        <button
          onClick={() => void increaseFontSize()}
          disabled={fontSize === 'lg'}
          className="text-gray-500 hover:text-gray-300 transition-colors px-0.5 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
          aria-label="Increase font size"
        >
          <span className="font-bold select-none" style={{ fontSize: '14px' }}>A</span>
        </button>

        <button
          onClick={() => void toggle()}
          className="text-gray-500 hover:text-gray-300 transition-colors p-0.5"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {isPopup && (
          <button
            onClick={openFullTab}
            className="text-gray-500 hover:text-gray-300 transition-colors p-0.5"
            aria-label="Open in full window"
          >
            <Maximize2 size={14} />
          </button>
        )}
      </div>
    </header>
  )
}
