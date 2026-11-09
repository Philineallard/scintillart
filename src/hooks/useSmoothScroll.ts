import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Soft, eased page scrolling (Lenis) for long editorial pages.
 * Off for visitors who ask for reduced motion; removed when the page unmounts.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.9, smoothWheel: true, anchors: true })
    let frame = 0
    const tick = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
