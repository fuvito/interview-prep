import { create } from 'zustand'
import type { Answer, EvaluationResult, Question, QuestionFilter } from '@/types'
import { questionRepository } from '@/core/question-engine'
import { evaluate } from '@/core/assessment-engine'
import { progressTracker } from '@/core/progress-engine'

type LearningPhase = 'answering' | 'revealed'

interface LearningState {
  questions: Question[]
  currentIndex: number
  phase: LearningPhase
  selectedAnswerIds: string[]
  textInput: string
  evaluationResult: EvaluationResult | null

  load: (subjectId: string, topicId: string, filter?: QuestionFilter) => void
  selectAnswer: (optionId: string) => void
  setTextInput: (text: string) => void
  submitAnswer: () => void
  revealAnswer: () => void
  selfAssess: (assessment: 'correct' | 'incorrect') => void
  next: () => void
  previous: () => void
  reset: () => void
}

export const useLearningStore = create<LearningState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  phase: 'answering',
  selectedAnswerIds: [],
  textInput: '',
  evaluationResult: null,

  load: (_subjectId, topicId, filter) => {
    const questions = questionRepository.getByTopic(topicId, filter)
    set({ questions, currentIndex: 0, phase: 'answering', selectedAnswerIds: [], textInput: '', evaluationResult: null })
  },

  selectAnswer: (optionId) => {
    const { questions, currentIndex, selectedAnswerIds, phase } = get()
    const question = questions[currentIndex]
    if (!question || phase === 'revealed') return
    if (question.type === 'multiple') {
      const already = selectedAnswerIds.includes(optionId)
      set({ selectedAnswerIds: already ? selectedAnswerIds.filter((id) => id !== optionId) : [...selectedAnswerIds, optionId] })
    } else {
      set({ selectedAnswerIds: [optionId] })
    }
  },

  setTextInput: (text) => set({ textInput: text }),

  submitAnswer: () => {
    const { questions, currentIndex, selectedAnswerIds } = get()
    const question = questions[currentIndex]
    if (!question) return
    const answer: Answer = { kind: 'choice', selectedAnswerIds }
    const result = evaluate(question, answer)
    void progressTracker.recordAttempt(question.id, result.isCorrect)
    set({ evaluationResult: result, phase: 'revealed' })
  },

  revealAnswer: () => set({ phase: 'revealed' }),

  selfAssess: (assessment) => {
    const { questions, currentIndex } = get()
    const question = questions[currentIndex]
    if (!question) return
    const answer: Answer = { kind: 'text', selfAssessment: assessment }
    const result = evaluate(question, answer)
    void progressTracker.recordAttempt(question.id, result.isCorrect)
    set({ evaluationResult: result })
  },

  next: () => {
    const { questions, currentIndex } = get()
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, phase: 'answering', selectedAnswerIds: [], textInput: '', evaluationResult: null })
    }
  },

  previous: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, phase: 'answering', selectedAnswerIds: [], textInput: '', evaluationResult: null })
    }
  },

  reset: () => set({ questions: [], currentIndex: 0, phase: 'answering', selectedAnswerIds: [], textInput: '', evaluationResult: null }),
}))
