import type { Answer, EvaluationResult, Question } from '@/types'
import {
  scoreSingleChoice,
  scoreMultipleSelect,
  scoreCodeOutput,
} from '@/core/scoring-engine'

export function evaluate(question: Question, answer: Answer): EvaluationResult {
  if (answer.kind === 'text') {
    return evaluateTextQuestion(question, answer.selfAssessment)
  }
  return evaluateChoiceQuestion(question, answer.selectedAnswerIds)
}

function evaluateChoiceQuestion(
  question: Question,
  selectedAnswerIds: string[],
): EvaluationResult {
  const correctAnswerIds = question.correctAnswers ?? []
  let isCorrect: boolean

  switch (question.type) {
    case 'single':
      isCorrect = scoreSingleChoice(selectedAnswerIds, correctAnswerIds)
      break
    case 'multiple':
      isCorrect = scoreMultipleSelect(selectedAnswerIds, correctAnswerIds)
      break
    case 'code':
      isCorrect = scoreCodeOutput(selectedAnswerIds, correctAnswerIds)
      break
    default:
      isCorrect = false
  }

  return {
    isCorrect,
    selectedAnswerIds,
    correctAnswerIds,
    score: isCorrect ? 1 : 0,
    questionType: question.type,
  }
}

function evaluateTextQuestion(
  question: Question,
  selfAssessment: 'correct' | 'incorrect',
): EvaluationResult {
  const isCorrect = selfAssessment === 'correct'
  return {
    isCorrect,
    selectedAnswerIds: [],
    correctAnswerIds: [],
    score: isCorrect ? 1 : 0,
    questionType: question.type,
  }
}
