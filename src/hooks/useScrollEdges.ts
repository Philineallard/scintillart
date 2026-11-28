import { useEffect, useState, type RefObject } from 'react'

/**
 * For a row that scrolls sideways: whether there is more to see to the left (start) and to
 * the right (end). Both false when everything fits. Updated on scroll and resize.
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState({ start: false, end: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      const next = { start: el.scrollLeft > 2, end: el.scrollLeft < max - 2 }
      setEdges((e) => (e.start === next.start && e.end === next.end ? e : next))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [ref])
  return edges
}
