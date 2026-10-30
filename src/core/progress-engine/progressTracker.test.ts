import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { QuestionProgress, Question, Topic } from '@/types'

vi.mock('@/database/repositories', () => ({
  questionProgressRepository: {
    get: vi.fn(),
    getByIds: vi.fn(),
    getAll: vi.fn(),
    upsert: vi.fn(),
    clear: vi.fn(),
  },
  assessmentSessionRepository: {
    clear: vi.fn(),
  },
}))

vi.mock('@/core/question-engine', () => ({
  questionRepository: {
    getByTopic: vi.fn(),
    getTopicsBySubject: vi.fn(),
  },
}))

import { progressTracker } from './progressTracker'
import { questionProgressRepository, assessmentSessionRepository } from '@/database/repositories'
import { questionRepository } from '@/core/question-engine'

const mockQP = vi.mocked(questionProgressRepository)
const mockAS = vi.mocked(assessmentSessionRepository)
const mockQR = vi.mocked(questionRepository)

const makeProgress = (overrides: Partial<QuestionProgress> = {}): QuestionProgress => ({
  questionId: 'q1',
  attempts: 1,
  correctAttempts: 1,
  incorrectAttempts: 0,
  lastAttemptAt: new Date().toISOString(),
  lastResult: 'correct',
  ...overrides,
})

const makeQuestion = (id: string, topicId = 't1'): Question => ({
  id,
  subjectId: 'typescript',
  topicId,
  type: 'single',
  difficulty: 'beginner',
  question: 'Q?',
  explanation: 'Expl.',
  keyConcepts: [],
  commonInterviewQuestion: false,
})

const makeTopic = (id: string): Topic => ({
  id,
  subjectId: 'typescript',
  name: id,
  description: '',
  order: 0,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('progressTracker.recordAttempt', () => {
  it('creates a new progress record on first attempt', async () => {
    mockQP.get.mockResolvedValue(undefined)
    mockQP.upsert.mockResolvedValue(undefined)

    const result = await progressTracker.recordAttempt('q1', true)

    expect(result.questionId).toBe('q1')
    expect(result.attempts).toBe(1)
    expect(result.correctAttempts).toBe(1)
    expect(result.incorrectAttempts).toBe(0)
    expect(result.lastResult).toBe('correct')
    expect(mockQP.upsert).toHaveBeenCalledWith(result)
  })

  it('increments counts on subsequent attempts', async () => {
    const existing = makeProgress({ attempts: 2, correctAttempts: 1, incorrectAttempts: 1 })
    mockQP.get.mockResolvedValue(existing)
    mockQP.upsert.mockResolvedValue(undefined)

    const result = await progressTracker.recordAttempt('q1', false)

    expect(result.attempts).toBe(3)
    expect(result.correctAttempts).toBe(1)
    expect(result.incorrectAttempts).toBe(2)
    expect(result.lastResult).toBe('incorrect')
  })

  it('records an incorrect attempt correctly', async () => {
    mockQP.get.mockResolvedValue(undefined)
    mockQP.upsert.mockResolvedValue(undefined)

    const result = await progressTracker.recordAttempt('q2', false)

    expect(result.correctAttempts).toBe(0)
    expect(result.incorrectAttempts).toBe(1)
    expect(result.lastResult).toBe('incorrect')
  })
})

describe('progressTracker.resetAllProgress', () => {
  it('clears both question progress and assessment sessions', async () => {
    mockQP.clear.mockResolvedValue(undefined)
    mockAS.clear.mockResolvedValue(undefined)

    await progressTracker.resetAllProgress()

    expect(mockQP.clear).toHaveBeenCalledOnce()
    expect(mockAS.clear).toHaveBeenCalledOnce()
  })
})

describe('progressTracker.getWeakAreas', () => {
  it('returns topics below the threshold sorted by correctRate ascending', async () => {
    const questions = [makeQuestion('q1', 't1'), makeQuestion('q2', 't2')]
    mockQR.getTopicsBySubject.mockReturnValue([makeTopic('t1'), makeTopic('t2')])
    mockQR.getByTopic
      .mockReturnValueOnce([questions[0]])
      .mockReturnValueOnce([questions[1]])
    mockQP.getByIds
      .mockResolvedValueOnce([makeProgress({ questionId: 'q1', correctAttempts: 2, incorrectAttempts: 8 })])
      .mockResolvedValueOnce([makeProgress({ questionId: 'q2', correctAttempts: 3, incorrectAttempts: 7 })])

    const weak = await progressTracker.getWeakAreas('typescript', 0.6)

    expect(weak).toHaveLength(2)
    expect(weak[0].correctRate).toBeLessThan(weak[1].correctRate)
    expect(weak[0].topicId).toBe('t1')
  })

  it('excludes topics above the threshold', async () => {
    mockQR.getTopicsBySubject.mockReturnValue([makeTopic('t1')])
    mockQR.getByTopic.mockReturnValue([makeQuestion('q1', 't1')])
    mockQP.getByIds.mockResolvedValue([
      makeProgress({ questionId: 'q1', correctAttempts: 9, incorrectAttempts: 1 }),
    ])

    const weak = await progressTracker.getWeakAreas('typescript', 0.6)
    expect(weak).toHaveLength(0)
  })

  it('excludes topics with no attempts', async () => {
    mockQR.getTopicsBySubject.mockReturnValue([makeTopic('t1')])
    mockQR.getByTopic.mockReturnValue([makeQuestion('q1', 't1')])
    mockQP.getByIds.mockResolvedValue([])

    const weak = await progressTracker.getWeakAreas('typescript', 0.6)
    expect(weak).toHaveLength(0)
  })
})

describe('progressTracker.getRecentlyAttempted', () => {
  it('returns progress sorted by most recent first', async () => {
    const old = makeProgress({ questionId: 'q1', lastAttemptAt: '2024-01-01T00:00:00Z' })
    const recent = makeProgress({ questionId: 'q2', lastAttemptAt: '2024-06-01T00:00:00Z' })
    mockQP.getAll.mockResolvedValue([old, recent])

    const result = await progressTracker.getRecentlyAttempted(10)

    expect(result[0].questionId).toBe('q2')
    expect(result[1].questionId).toBe('q1')
  })

  it('respects the limit', async () => {
    const records = Array.from({ length: 20 }, (_, i) =>
      makeProgress({ questionId: `q${i}`, lastAttemptAt: new Date(i * 1000).toISOString() }),
    )
    mockQP.getAll.mockResolvedValue(records)

    const result = await progressTracker.getRecentlyAttempted(5)
    expect(result).toHaveLength(5)
  })
})
