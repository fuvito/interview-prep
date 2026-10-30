interface Props {
  current: number
  total: number
  className?: string
}

export function ProgressBar({ current, total, className = '' }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className={`h-1.5 w-full bg-gray-800 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 90 ? 'bg-emerald-500' :
    score >= 75 ? 'bg-blue-500' :
    score >= 60 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
    </div>
  )
}
