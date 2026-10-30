interface Props {
  title?: string
  message: string
}

export function EmptyState({ title = 'Nothing here', message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-2">
      <p className="text-gray-300 font-medium">{title}</p>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
