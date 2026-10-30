import { create } from 'zustand'
import type { Answer, AssessmentSession, EvaluationResult, Question } from '@/types'
import { questionRepository } from '@/core/question-engine'
import { evaluate } from '@/core/assessment-engine'
import { calculateSessionScore } from '@/core/scoring-engine'
import { progressTracker } from '@/core/progress-engine'
import { assessmentSessionRepository } from '@/database/repositories'

type InterviewPhase = 'answering' | 'revealed'

interface InterviewState {
  sessionId: string
  subjectId: string
  questions: Question[]
  currentIndex: number
  results: Record<string, EvaluationResult>
  selectedAnswerIds: string[]
  phase: InterviewPhase
  startedAt: string | null
  completedSession: AssessmentSession | null

  start: (subjectId: string, topicIds: string[], questionCount: number) => void
  selectAnswer: (optionId: string) => void
  submitAnswer: () => void
  advanceOrFinish: () => Promise<boolean>
  stopAndSave: () => Promise<void>
  reset: () => void
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  sessionId: '',
  subjectId: '',
  questions: [],
  currentIndex: 0,
  results: {},
  selectedAnswerIds: [],
  phase: 'answering',
  startedAt: null,
  completedSession: null,

  start: (subjectId, topicIds, questionCount) => {
    let pool = topicIds.length > 0
      ? questionRepository.getBySubject(subjectId).filter((q) => topicIds.includes(q.topicId))
      : questionRepository.getBySubject(subjectId)
    pool = pool.filter((q) => q.type !== 'text')
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    set({
      sessionId: crypto.randomUUID(),
      subjectId,
      questions: shuffled.slice(0, Math.min(questionCount, shuffled.length)),
      currentIndex: 0,
      results: {},
      selectedAnswerIds: [],
      phase: 'answering',
      startedAt: new Date().toISOString(),
      completedSession: null,
    })
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

  submitAnswer: () => {
    const { questions, currentIndex, selectedAnswerIds } = get()
    const question = questions[currentIndex]
    if (!question) return
    const answer: Answer = { kind: 'choice', selectedAnswerIds }
    const result = evaluate(question, answer)
    set((state) => ({ results: { ...state.results, [question.id]: result }, phase: 'revealed' }))
  },

  advanceOrFinish: async () => {
    const { questions, currentIndex, results, subjectId, sessionId, startedAt } = get()

    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, selectedAnswerIds: [], phase: 'answering' })
      return false
    }

    const correctCount = Object.values(results).filter((r) => r.isCorrect).length
    const now = new Date().toISOString()
    const session: AssessmentSession = {
      id: sessionId,
      subjectId,
      topicIds: [...new Set(questions.map((q) => q.topicId))],
      startedAt: startedAt ?? now,
      completedAt: now,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score: calculateSessionScore(correctCount, questions.length),
    }

    await assessmentSessionRepository.create(session)
    for (const [questionId, result] of Object.entries(results)) {
      await progressTracker.recordAttempt(questionId, result.isCorrect)
    }

    set({ completedSession: session })
    return true
  },

  stopAndSave: async () => {
    const { results } = get()
    for (const [questionId, result] of Object.entries(results)) {
      await progressTracker.recordAttempt(questionId, result.isCorrect)
    }
  },

  reset: () => set({ sessionId: '', subjectId: '', questions: [], currentIndex: 0, results: {}, selectedAnswerIds: [], phase: 'answering', startedAt: null, completedSession: null }),
}))
