/**
 * Scoring engine — pure functions with no side effects.
 * All question types ultimately produce a 0 or 1 score (correct/incorrect).
 * Multiple-select uses strict matching: every correct option must be selected
 * and no incorrect options may be included.
 */

export function scoreSingleChoice(selected: string[], correct: string[]): boolean {
  return selected.length === 1 && correct.length >= 1 && selected[0] === correct[0]
}

export function scoreMultipleSelect(selected: string[], correct: string[]): boolean {
  if (selected.length !== correct.length) return false
  const correctSet = new Set(correct)
  return selected.every((id) => correctSet.has(id))
}

// code-output questions use the same single-choice logic
export const scoreCodeOutput = scoreSingleChoice

export function calculateSessionScore(correctCount: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0
  return Math.round((correctCount / totalQuestions) * 100)
}
