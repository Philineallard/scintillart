import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Soft, eased page scrolling (Lenis) for long editorial pages, including #anchor links
 * (Lenis honours each target's scroll-margin-top). Removed when the page unmounts.
 * On for everyone, reduced-motion settings included: an explicit decision by the
 * Scintillart team (see CLAUDE.md).
 *
 * Returns the instance, so a modal can stop and restart page scrolling.
 */
export function useSmoothScroll(enabled = true) {
  const lenisRef = useRef<Lenis | null>(null)
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.9, smoothWheel: true, anchors: true })
    lenisRef.current = lenis
    let frame = 0
    const tick = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])
  return lenisRef
}
