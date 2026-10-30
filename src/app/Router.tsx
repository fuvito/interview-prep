import { useNavigationStore } from '@/store'
import { DashboardView } from '@/features/dashboard/DashboardView'
import { SubjectsView } from '@/features/subjects/SubjectsView'
import { TopicsView } from '@/features/subjects/TopicsView'
import { LearningView } from '@/features/learning/LearningView'
import { InterviewSetupView } from '@/features/interview/InterviewSetupView'
import { InterviewView } from '@/features/interview/InterviewView'
import { ResultsView } from '@/features/results/ResultsView'
import { ProgressView } from '@/features/progress/ProgressView'
import { BookmarksView } from '@/features/bookmarks/BookmarksView'
import { AboutView } from '@/features/about/AboutView'

export function Router() {
  const { current } = useNavigationStore()

  switch (current.name) {
    case 'dashboard':       return <DashboardView />
    case 'subjects':        return <SubjectsView />
    case 'topics':          return <TopicsView subjectId={current.subjectId} />
    case 'learning':        return <LearningView />
    case 'interview-setup': return <InterviewSetupView subjectId={current.subjectId} />
    case 'interview':       return <InterviewView />
    case 'results':         return <ResultsView />
    case 'progress':        return <ProgressView />
    case 'bookmarks':       return <BookmarksView />
    case 'about':           return <AboutView />
  }
}
