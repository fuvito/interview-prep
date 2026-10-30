import { describe, it, expect } from 'vitest'
import { evaluate } from './evaluator'
import type { Question } from '@/types'

const baseQuestion: Question = {
  id: 'q1',
  subjectId: 'typescript',
  topicId: 'basics',
  type: 'single',
  difficulty: 'beginner',
  question: 'What is TypeScript?',
  explanation: 'TypeScript is a typed superset of JavaScript.',
  keyConcepts: [],
  commonInterviewQuestion: false,
}

describe('evaluate — single choice', () => {
  it('is correct when selected answer matches', () => {
    const q: Question = { ...baseQuestion, type: 'single', correctAnswers: ['opt-a'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: ['opt-a'] })
    expect(result.isCorrect).toBe(true)
    expect(result.score).toBe(1)
    expect(result.questionType).toBe('single')
    expect(result.correctAnswerIds).toEqual(['opt-a'])
    expect(result.selectedAnswerIds).toEqual(['opt-a'])
  })

  it('is incorrect when wrong option selected', () => {
    const q: Question = { ...baseQuestion, type: 'single', correctAnswers: ['opt-a'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: ['opt-b'] })
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0)
  })

  it('is incorrect when nothing is selected', () => {
    const q: Question = { ...baseQuestion, type: 'single', correctAnswers: ['opt-a'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: [] })
    expect(result.isCorrect).toBe(false)
  })
})

describe('evaluate — multiple choice', () => {
  it('is correct for exact selection', () => {
    const q: Question = { ...baseQuestion, type: 'multiple', correctAnswers: ['a', 'b'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: ['a', 'b'] })
    expect(result.isCorrect).toBe(true)
    expect(result.questionType).toBe('multiple')
  })

  it('is incorrect when only a subset is selected', () => {
    const q: Question = { ...baseQuestion, type: 'multiple', correctAnswers: ['a', 'b'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: ['a'] })
    expect(result.isCorrect).toBe(false)
  })

  it('is incorrect when an extra option is selected', () => {
    const q: Question = { ...baseQuestion, type: 'multiple', correctAnswers: ['a', 'b'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: ['a', 'b', 'c'] })
    expect(result.isCorrect).toBe(false)
  })
})

describe('evaluate — code output', () => {
  it('is correct when selected matches', () => {
    const q: Question = { ...baseQuestion, type: 'code', correctAnswers: ['opt-c'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: ['opt-c'] })
    expect(result.isCorrect).toBe(true)
    expect(result.questionType).toBe('code')
  })

  it('is incorrect for wrong selection', () => {
    const q: Question = { ...baseQuestion, type: 'code', correctAnswers: ['opt-c'] }
    const result = evaluate(q, { kind: 'choice', selectedAnswerIds: ['opt-d'] })
    expect(result.isCorrect).toBe(false)
  })
})

describe('evaluate — text (self-assessment)', () => {
  it('is correct when self-assessed as correct', () => {
    const q: Question = { ...baseQuestion, type: 'text' }
    const result = evaluate(q, { kind: 'text', selfAssessment: 'correct' })
    expect(result.isCorrect).toBe(true)
    expect(result.score).toBe(1)
    expect(result.questionType).toBe('text')
    expect(result.selectedAnswerIds).toEqual([])
    expect(result.correctAnswerIds).toEqual([])
  })

  it('is incorrect when self-assessed as incorrect', () => {
    const q: Question = { ...baseQuestion, type: 'text' }
    const result = evaluate(q, { kind: 'text', selfAssessment: 'incorrect' })
    expect(result.isCorrect).toBe(false)
    expect(result.score).toBe(0)
  })
})
