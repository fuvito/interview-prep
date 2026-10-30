import { describe, it, expect } from 'vitest'
import {
  scoreSingleChoice,
  scoreMultipleSelect,
  scoreCodeOutput,
  calculateSessionScore,
} from './scorer'

describe('scoreSingleChoice', () => {
  it('returns true when selected matches the correct answer', () => {
    expect(scoreSingleChoice(['a'], ['a'])).toBe(true)
  })

  it('returns false when selected is wrong', () => {
    expect(scoreSingleChoice(['b'], ['a'])).toBe(false)
  })

  it('returns false when nothing is selected', () => {
    expect(scoreSingleChoice([], ['a'])).toBe(false)
  })

  it('returns false when multiple are selected', () => {
    expect(scoreSingleChoice(['a', 'b'], ['a'])).toBe(false)
  })

  it('returns false when correct array is empty', () => {
    expect(scoreSingleChoice(['a'], [])).toBe(false)
  })
})

describe('scoreMultipleSelect', () => {
  it('returns true for exact match', () => {
    expect(scoreMultipleSelect(['a', 'b'], ['a', 'b'])).toBe(true)
  })

  it('returns true regardless of selection order', () => {
    expect(scoreMultipleSelect(['b', 'a'], ['a', 'b'])).toBe(true)
  })

  it('returns false when missing a correct option', () => {
    expect(scoreMultipleSelect(['a'], ['a', 'b'])).toBe(false)
  })

  it('returns false when an extra option is selected', () => {
    expect(scoreMultipleSelect(['a', 'b', 'c'], ['a', 'b'])).toBe(false)
  })

  it('returns false when entirely wrong options are selected', () => {
    expect(scoreMultipleSelect(['c', 'd'], ['a', 'b'])).toBe(false)
  })

  it('returns true for single-element exact match', () => {
    expect(scoreMultipleSelect(['x'], ['x'])).toBe(true)
  })
})

describe('scoreCodeOutput', () => {
  it('returns true when selected matches', () => {
    expect(scoreCodeOutput(['x'], ['x'])).toBe(true)
  })

  it('returns false when selected is wrong', () => {
    expect(scoreCodeOutput(['x'], ['y'])).toBe(false)
  })

  it('behaves identically to scoreSingleChoice', () => {
    expect(scoreCodeOutput).toBe(scoreSingleChoice)
  })
})

describe('calculateSessionScore', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateSessionScore(0, 0)).toBe(0)
  })

  it('returns 100 for perfect score', () => {
    expect(calculateSessionScore(10, 10)).toBe(100)
  })

  it('returns 50 for half correct', () => {
    expect(calculateSessionScore(5, 10)).toBe(50)
  })

  it('rounds to nearest integer', () => {
    expect(calculateSessionScore(1, 3)).toBe(33)
    expect(calculateSessionScore(2, 3)).toBe(67)
  })

  it('returns 0 when correct is 0', () => {
    expect(calculateSessionScore(0, 10)).toBe(0)
  })
})
