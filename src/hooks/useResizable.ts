import { useState, useEffect, useRef } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

const MIN_W = 360
const MAX_W = 960
const MIN_H = 480
const MAX_H = 980
const DEFAULT_W = 480
const DEFAULT_H = 600
const STORAGE_KEY = 'ip-sz'
const GRIP = 6

type Dir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const DIRECTIONS: Dir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function handleStyle(dir: Dir): CSSProperties {
  const base: CSSProperties = { position: 'absolute', zIndex: 9999, userSelect: 'none' }
  const C = GRIP * 2
  switch (dir) {
    case 'n':  return { ...base, top: 0, left: C, right: C, height: GRIP, cursor: 'ns-resize' }
    case 's':  return { ...base, bottom: 0, left: C, right: C, height: GRIP, cursor: 'ns-resize' }
    case 'e':  return { ...base, right: 0, top: C, bottom: C, width: GRIP, cursor: 'ew-resize' }
    case 'w':  return { ...base, left: 0, top: C, bottom: C, width: GRIP, cursor: 'ew-resize' }
    case 'nw': return { ...base, top: 0, left: 0, width: C, height: C, cursor: 'nwse-resize' }
    case 'ne': return { ...base, top: 0, right: 0, width: C, height: C, cursor: 'nesw-resize' }
    case 'sw': return { ...base, bottom: 0, left: 0, width: C, height: C, cursor: 'nesw-resize' }
    case 'se': return { ...base, bottom: 0, right: 0, width: C, height: C, cursor: 'nwse-resize' }
  }
}

function loadSize(): { w: number; h: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as { w: number; h: number }
      return { w: clamp(p.w, MIN_W, MAX_W), h: clamp(p.h, MIN_H, MAX_H) }
    }
  } catch { /* use defaults */ }
  return { w: DEFAULT_W, h: DEFAULT_H }
}

export interface ResizeHandle {
  dir: Dir
  style: CSSProperties
  onMouseDown: (e: MouseEvent) => void
}

function applyToBody(w: number, h: number) {
  document.body.style.width = `${w}px`
  document.body.style.height = `${h}px`
  document.body.style.overflow = 'hidden'
}

export function useResizable() {
  const [size, setSize] = useState(loadSize)
  const sizeRef = useRef(size)
  sizeRef.current = size

  // Sync size → document.body so Chrome resizes the popup window
  useEffect(() => {
    applyToBody(size.w, size.h)
  }, [size])

  const drag = useRef<{
    dir: Dir
    x0: number
    y0: number
    w0: number
    h0: number
  } | null>(null)

  useEffect(() => {
    function onMove(e: globalThis.MouseEvent) {
      if (!drag.current) return
      const { dir, x0, y0, w0, h0 } = drag.current
      const dx = e.clientX - x0
      const dy = e.clientY - y0
      setSize({
        w: dir.includes('e') ? clamp(w0 + dx, MIN_W, MAX_W)
          : dir.includes('w') ? clamp(w0 - dx, MIN_W, MAX_W)
          : w0,
        h: dir.includes('s') ? clamp(h0 + dy, MIN_H, MAX_H)
          : dir.includes('n') ? clamp(h0 - dy, MIN_H, MAX_H)
          : h0,
      })
    }

    function onUp() {
      if (!drag.current) return
      drag.current = null
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sizeRef.current))
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const handles: ResizeHandle[] = DIRECTIONS.map(dir => ({
    dir,
    style: handleStyle(dir),
    onMouseDown(e: MouseEvent) {
      e.preventDefault()
      drag.current = { dir, x0: e.clientX, y0: e.clientY, w0: sizeRef.current.w, h0: sizeRef.current.h }
    },
  }))

  return { size, handles }
}
