import { type RefObject, useCallback, useEffect, useState } from 'react'

/**
 * Maps the page's scroll position to a step index. The entry page is taller than
 * the viewport only to create a short scroll track; the cover itself is pinned
 * (position: sticky), so scrolling changes the active step instead of moving the page.
 * State updates only when the step changes, never per scroll event.
 */
export function useScrollSteps(trackRef: RefObject<HTMLElement | null>, steps: number, reducedMotion: boolean) {
  const [step, setStep] = useState(0)

  const stepLength = useCallback(() => {
    const track = trackRef.current
    if (!track || steps < 2) return 0
    return Math.max(1, (track.offsetHeight - window.innerHeight) / (steps - 1))
  }, [trackRef, steps])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const len = stepLength()
      if (!len) return
      const next = Math.min(steps - 1, Math.max(0, Math.floor(window.scrollY / len + 0.5)))
      setStep((prev) => (prev === next ? prev : next))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steps, stepLength])

  /** Jump to a step (from the step indicator), scrolling the track to match. */
  const goTo = useCallback(
    (index: number) => {
      window.scrollTo({ top: index * stepLength(), behavior: reducedMotion ? 'auto' : 'smooth' })
      setStep(index)
    },
    [stepLength, reducedMotion],
  )

  return { sense: step, goToSense: goTo }
}
