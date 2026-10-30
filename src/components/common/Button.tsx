import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
type Size = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700',
  ghost:     'hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-transparent',
  success:   'bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800',
  danger:    'bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', disabled, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-lg font-medium
        transition-colors cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
    >
      {children}
    </button>
  )
}
