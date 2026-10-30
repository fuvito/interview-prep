import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Bookmark, Question } from '@/types'

vi.mock('@/database/repositories', () => ({
  bookmarkRepository: {
    toggle: vi.fn(),
    isBookmarked: vi.fn(),
    getAll: vi.fn(),
  },
}))

vi.mock('@/core/question-engine', () => ({
  questionRepository: {
    getByIds: vi.fn(),
  },
}))

import { bookmarkEngine } from './bookmarkEngine'
import { bookmarkRepository } from '@/database/repositories'
import { questionRepository } from '@/core/question-engine'

const mockBR = vi.mocked(bookmarkRepository)
const mockQR = vi.mocked(questionRepository)

const makeBookmark = (questionId: string): Bookmark => ({
  questionId,
  createdAt: new Date().toISOString(),
})

const makeQuestion = (id: string): Question => ({
  id,
  subjectId: 'typescript',
  topicId: 'ts-basics',
  type: 'single',
  difficulty: 'beginner',
  question: 'Q?',
  explanation: 'Expl.',
  keyConcepts: [],
  commonInterviewQuestion: false,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('bookmarkEngine.toggle', () => {
  it('delegates to bookmarkRepository and returns true when newly bookmarked', async () => {
    mockBR.toggle.mockResolvedValue(true)
    const result = await bookmarkEngine.toggle('q1')
    expect(mockBR.toggle).toHaveBeenCalledWith('q1')
    expect(result).toBe(true)
  })

  it('returns false when the bookmark is removed', async () => {
    mockBR.toggle.mockResolvedValue(false)
    const result = await bookmarkEngine.toggle('q1')
    expect(result).toBe(false)
  })
})

describe('bookmarkEngine.isBookmarked', () => {
  it('returns true when the question is bookmarked', async () => {
    mockBR.isBookmarked.mockResolvedValue(true)
    const result = await bookmarkEngine.isBookmarked('q1')
    expect(mockBR.isBookmarked).toHaveBeenCalledWith('q1')
    expect(result).toBe(true)
  })

  it('returns false when the question is not bookmarked', async () => {
    mockBR.isBookmarked.mockResolvedValue(false)
    expect(await bookmarkEngine.isBookmarked('q1')).toBe(false)
  })
})

describe('bookmarkEngine.getAll', () => {
  it('returns all bookmarks from the repository', async () => {
    const bookmarks = [makeBookmark('q1'), makeBookmark('q2')]
    mockBR.getAll.mockResolvedValue(bookmarks)
    const result = await bookmarkEngine.getAll()
    expect(result).toEqual(bookmarks)
    expect(mockBR.getAll).toHaveBeenCalledOnce()
  })

  it('returns an empty array when there are no bookmarks', async () => {
    mockBR.getAll.mockResolvedValue([])
    expect(await bookmarkEngine.getAll()).toEqual([])
  })
})

describe('bookmarkEngine.getBookmarkedQuestions', () => {
  it('fetches questions by ids derived from bookmarks', async () => {
    const bookmarks = [makeBookmark('q1'), makeBookmark('q2')]
    const questions = [makeQuestion('q1'), makeQuestion('q2')]
    mockBR.getAll.mockResolvedValue(bookmarks)
    mockQR.getByIds.mockReturnValue(questions)

    const result = await bookmarkEngine.getBookmarkedQuestions()

    expect(mockQR.getByIds).toHaveBeenCalledWith(['q1', 'q2'])
    expect(result).toEqual(questions)
  })

  it('passes an empty array to getByIds when there are no bookmarks', async () => {
    mockBR.getAll.mockResolvedValue([])
    mockQR.getByIds.mockReturnValue([])

    const result = await bookmarkEngine.getBookmarkedQuestions()

    expect(mockQR.getByIds).toHaveBeenCalledWith([])
    expect(result).toEqual([])
  })
})
