import { useThemeStore } from '@/store'

const SCALE: Record<string, number> = {
  xs: 0.82, sm: 0.88, md: 1, lg: 1.12, xl: 1.24, '2xl': 1.35, '3xl': 1.53, '4xl': 1.76,
}

export function useIconSize() {
  const { fontSize } = useThemeStore()
  const scale = SCALE[fontSize] ?? 1
  return (base: number) => Math.round(base * scale)
}
