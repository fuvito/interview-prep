import type { Difficulty, QuestionType } from '@/types'

const difficultyStyles: Record<Difficulty, string> = {
  beginner:     'bg-emerald-900/40 text-emerald-400 border-emerald-800',
  intermediate: 'bg-amber-900/40 text-amber-400 border-amber-800',
  advanced:     'bg-red-900/40 text-red-400 border-red-800',
}

const typeLabels: Record<QuestionType, string> = {
  single:   'Single Choice',
  multiple: 'Multi Select',
  code:     'Code Output',
  text:     'Free Text',
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${difficultyStyles[difficulty]}`}>
      {difficulty}
    </span>
  )
}

export function TypeBadge({ type }: { type: QuestionType }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded border border-gray-700 text-gray-400 bg-gray-800/50">
      {typeLabels[type]}
    </span>
  )
}
