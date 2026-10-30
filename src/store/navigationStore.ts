import { create } from 'zustand'
import { userPreferencesRepository } from '@/database/repositories'
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
  | { name: 'about' }
  | { name: 'doc'; docId: 'user-guide' | 'privacy' | 'terms' | 'changelog' | 'license' }

interface NavigationState {
  current: View
  stack: View[]
  currentSubjectId: string | null
  navigate: (view: View) => void
  navigateRoot: (view: View) => void
  goBack: () => void
  setCurrentSubject: (subjectId: string) => Promise<void>
  initCurrentSubject: () => Promise<void>
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  current: { name: 'dashboard' },
  stack: [],
  currentSubjectId: null,

  navigate: (view) => {
    set((state) => ({ stack: [...state.stack, state.current], current: view }))
    if (view.name === 'topics') {
      void get().setCurrentSubject(view.subjectId)
    }
  },

  navigateRoot: (view) => {
    set({ current: view, stack: [] })
    if (view.name === 'topics') {
      void get().setCurrentSubject(view.subjectId)
    }
  },

  goBack: () => {
    const { stack } = get()
    if (stack.length === 0) return
    set((state) => ({
      current: state.stack[state.stack.length - 1],
      stack: state.stack.slice(0, -1),
    }))
  },

  setCurrentSubject: async (subjectId) => {
    set({ currentSubjectId: subjectId })
    await userPreferencesRepository.save({ lastSubjectId: subjectId })
  },

  initCurrentSubject: async () => {
    const prefs = await userPreferencesRepository.get()
    if (prefs.lastSubjectId) {
      set({ currentSubjectId: prefs.lastSubjectId })
    }
  },
}))
