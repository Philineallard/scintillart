import { useEffect, type RefObject } from 'react'

/**
 * Photographs that arrive as you scroll: every [data-reveal] element inside `root` starts
 * as a flat block and its image fades in the first time it enters the viewport (CSS does
 * the motion, keyed on [data-shown]). Before JavaScript runs (pre-rendered HTML) and
 * without IntersectionObserver, everything is simply visible.
 */
export function useReveal(root: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = root.current
    if (!enabled || !el || !('IntersectionObserver' in window)) return
    el.dataset.revealReady = ''
    const targets = [...el.querySelectorAll<HTMLElement>('[data-reveal]')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          ;(e.target as HTMLElement).dataset.shown = ''
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    targets.forEach((t) => io.observe(t))
    return () => {
      io.disconnect()
      delete el.dataset.revealReady
    }
  }, [root, enabled])
}
