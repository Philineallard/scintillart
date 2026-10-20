import { useEffect, useRef } from 'react'
import styles from './ScintillaCursor.module.css'

/**
 * Homepage cursor: a small ink point with a trailing ring that opens over links.
 * The pointer's "trail" on the homepage is the fluid distortion (src/fluid), not
 * particles. Mouse only, never with reduced motion; the system cursor returns on
 * every other page (this component unmounts and removes its class).
 */
const RING_LERP = 0.18 // how quickly the ring catches up with the point

export function ScintillaCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dot = dotRef.current
    const ring = ringRef.current
    if (!fine || reduced || !dot || !ring) return

    document.documentElement.classList.add('has-scintilla-cursor')
    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    let frame = 0
    let visible = false

    const draw = () => {
      frame = 0
      ringPos.x += (pos.x - ringPos.x) * RING_LERP
      ringPos.y += (pos.y - ringPos.y) * RING_LERP
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      if (Math.abs(pos.x - ringPos.x) + Math.abs(pos.y - ringPos.y) > 0.3) frame = requestAnimationFrame(draw)
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) {
        visible = true
        ringPos.x = pos.x
        ringPos.y = pos.y
        dot.dataset.visible = ''
        ring.dataset.visible = ''
      }
      kick()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') ring.dataset.pressed = ''
    }
    const onUp = () => {
      delete ring.dataset.pressed
    }
    const onOver = (e: PointerEvent) => {
      const interactive = (e.target as Element | null)?.closest?.('a, button, [role="button"], label, summary')
      if (interactive) ring.dataset.hover = ''
      else delete ring.dataset.hover
    }
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget) return
      visible = false
      delete dot.dataset.visible
      delete ring.dataset.visible
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onLeave, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('has-scintilla-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onLeave)
    }
  }, [])

  return (
    <div className={styles.layer} aria-hidden="true">
      <div ref={ringRef} className={styles.ring} />
      <div ref={dotRef} className={styles.dot} />
    </div>
  )
}
