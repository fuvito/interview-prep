import { ArrowLeft, Sun, Moon, Info, ExternalLink, Maximize, Minimize } from 'lucide-react'
import { useNavigationStore, useThemeStore } from '@/store'
import { questionRepository } from '@/core/question-engine'
import { usePopupSize } from '@/hooks/usePopupSize'
import { isPopup } from '@/app/App'
import type { View } from '@/store'

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
  const { expanded, toggle: toggleSize } = usePopupSize()
  const canGoBack = stack.length > 0
  const isDashboard = current.name === 'dashboard'
  const hasSubject = isDashboard && currentSubjectId !== null

  function openFullTab() {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html?tab=1') })
  }

  const title = getTitle(current, currentSubjectId)
  const btnClass = 'text-blue-300 hover:text-white transition-colors p-0.5'

  return (
    <header className="h-12 flex items-center px-4 border-b border-blue-900/40 bg-[#0c1628] shrink-0 gap-3">
      {canGoBack ? (
        <button
          onClick={goBack}
          className={btnClass}
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

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {isDashboard && (
          <button
            onClick={() => navigate({ name: 'about' })}
            className={btnClass}
            aria-label="About"
          >
            <Info size={15} />
          </button>
        )}

        <button
          onClick={() => void decreaseFontSize()}
          disabled={fontSize === 'xs'}
          className={`${btnClass} disabled:opacity-30 disabled:cursor-not-allowed leading-none px-0.5`}
          aria-label="Decrease font size"
        >
          <span className="font-bold select-none" style={{ fontSize: '10px' }}>A</span>
        </button>
        <button
          onClick={() => void increaseFontSize()}
          disabled={fontSize === 'lg'}
          className={`${btnClass} disabled:opacity-30 disabled:cursor-not-allowed leading-none px-0.5`}
          aria-label="Increase font size"
        >
          <span className="font-bold select-none" style={{ fontSize: '14px' }}>A</span>
        </button>

        <button
          onClick={() => void toggle()}
          className={btnClass}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {isPopup && (
          <>
            <button
              onClick={toggleSize}
              className={btnClass}
              aria-label={expanded ? 'Restore width' : 'Expand width'}
            >
              {expanded ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>

            <button
              onClick={openFullTab}
              className={btnClass}
              aria-label="Open in full tab"
            >
              <ExternalLink size={14} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
