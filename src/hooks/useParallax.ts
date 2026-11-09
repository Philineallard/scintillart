import { useEffect, type RefObject } from 'react'

/**
 * Slow drift for a banner photograph: as the page scrolls past it, the image
 * moves at a fraction of the scroll speed inside its frame. The image is drawn
 * `travel` taller than the frame and starts aligned to the bottom, so nothing
 * below the top `travel` is ever cropped and no gap opens. Off with reduced motion.
 */
export function useParallax(frame: RefObject<HTMLElement | null>, travel = 0.14) {
  useEffect(() => {
    const el = frame.current
    const img = el?.querySelector('img')
    if (!el || !img) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.dataset.parallax = ''
    let raf = 0
    const update = () => {
      const rect = el.getBoundingClientRect()
      const span = rect.height + Math.max(0, rect.top + window.scrollY)
      const p = Math.min(1, Math.max(0, window.scrollY / span))
      img.style.transform = `translate3d(0, ${(-travel + travel * p) * rect.height}px, 0)`
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(raf)
      delete el.dataset.parallax
      img.style.transform = ''
    }
  }, [frame, travel])
}
