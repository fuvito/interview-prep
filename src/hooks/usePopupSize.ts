import { useEffect } from 'react'
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'ip-expanded'

const SIZE_NORMAL   = { w: 480, h: 600 } as const
const SIZE_EXPANDED = { w: 800, h: 600 } as const

type Listener = () => void
const listeners = new Set<Listener>()
let _expanded = localStorage.getItem(STORAGE_KEY) === 'true'

function getSnapshot() { return _expanded }
function subscribe(fn: Listener) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

function applyToBody(w: number, h: number) {
  const ws = `${w}px`, hs = `${h}px`
  for (const el of [document.documentElement, document.body]) {
    el.style.width = ws
    el.style.maxWidth = ws
    el.style.height = hs
    el.style.maxHeight = hs
    el.style.overflow = 'hidden'
  }
}

// Apply synchronously on module load so Chrome sizes the popup before first paint
applyToBody(
  _expanded ? SIZE_EXPANDED.w : SIZE_NORMAL.w,
  _expanded ? SIZE_EXPANDED.h : SIZE_NORMAL.h,
)

export function usePopupSize() {
  const expanded = useSyncExternalStore(subscribe, getSnapshot)
  const size = expanded ? SIZE_EXPANDED : SIZE_NORMAL

  useEffect(() => {
    applyToBody(size.w, size.h)
  }, [size])

  function toggle() {
    _expanded = !_expanded
    localStorage.setItem(STORAGE_KEY, String(_expanded))
    listeners.forEach(fn => fn())
    const s = _expanded ? SIZE_EXPANDED : SIZE_NORMAL
    applyToBody(s.w, s.h)
  }

  return { size, expanded, toggle }
}
