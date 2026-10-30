import { create } from 'zustand'
import type { QuestionFilter } from '@/types'

export type View =
  | { name: 'dashboard' }
  | { name: 'subjects' }
  | { name: 'topics'; subjectId: string }
  | { name: 'learning'; subjectId: string; topicId: string; filter?: QuestionFilter }
  | { name: 'interview-setup'; subjectId: string }
  | { name: 'interview' }
  | { name: 'results' }
  | { name: 'progress' }
  | { name: 'bookmarks' }

interface NavigationState {
  current: View
  stack: View[]
  navigate: (view: View) => void
  navigateRoot: (view: View) => void
  goBack: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  current: { name: 'dashboard' },
  stack: [],
  navigate: (view) =>
    set((state) => ({ stack: [...state.stack, state.current], current: view })),
  navigateRoot: (view) => set({ current: view, stack: [] }),
  goBack: () => {
    const { stack } = get()
    if (stack.length === 0) return
    set((state) => ({
      current: state.stack[state.stack.length - 1],
      stack: state.stack.slice(0, -1),
    }))
  },
}))
