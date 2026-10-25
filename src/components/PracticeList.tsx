import { useEffect, useRef, useState } from 'react'
import type { Practice } from '../content/retreat'
import styles from './PracticeList.module.css'

type Props = {
  practices: readonly Practice[]
  /** Inside the inert transition layer: plain text, no interaction. */
  embedded?: boolean
}

const base = import.meta.env.BASE_URL

/**
 * Practices as a typographic list. Hovering (mouse), focusing (keyboard) or tapping
 * (touch) a practice brings up its photo as a floating print in the lower part of the
 * page, with the artist's name. One photo at a time; it sinks away when the pointer leaves.
 */
export function PracticeList({ practices, embedded = false }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState<number | null>(null) // last photo, kept while it slides away
  const listRef = useRef<HTMLUListElement>(null)
  const printRef = useRef<HTMLElement>(null)

  // The print leans gently toward the pointer (damped), like a card held in the air.
  useEffect(() => {
    if (embedded) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return
    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let raf = 0
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.06
      cur.y += (target.y - cur.y) * 0.06
      printRef.current?.style.setProperty('--lean-x', cur.x.toFixed(3))
      printRef.current?.style.setProperty('--lean-y', cur.y.toFixed(3))
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001 ? requestAnimationFrame(tick) : 0
    }
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
      if (!raf) raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [embedded])

  useEffect(() => {
    if (active !== null) setShown(active)
  }, [active])

  // Preload the photos once the page has settled, so the first reveal is instant.
  useEffect(() => {
    if (embedded) return
    const t = window.setTimeout(() => {
      practices.forEach((p) => {
        if (p.image) new Image().src = `${base}practices/${p.image.slug}.webp`
      })
    }, 1200)
    return () => window.clearTimeout(t)
  }, [practices, embedded])

  // Tap elsewhere or press Escape to close a photo opened by touch.
  useEffect(() => {
    if (active === null) return
    const onDown = (e: PointerEvent) => {
      if (!listRef.current?.contains(e.target as Node)) setActive(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [active])

  const current = shown !== null ? practices[shown] : null

  return (
    <>
      <ul ref={listRef} className={styles.list}>
        {practices.map((p, i) => (
          <li key={p.name} className={styles.item}>
            {p.image && !embedded ? (
              <button
                type="button"
                className={styles.practice}
                aria-pressed={active === i}
                aria-label={`${p.name}${p.by ? ` with ${p.by}` : ''}: show photo and description`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setActive((a) => (a === i ? null : a))}
                onClick={(e) => {
                  if ((e.nativeEvent as PointerEvent).pointerType === 'mouse') return
                  setActive((a) => (a === i ? null : i))
                }}
                onFocus={(e) => e.currentTarget.matches(':focus-visible') && setActive(i)}
                onBlur={() => setActive((a) => (a === i ? null : a))}
              >
                {p.name}
              </button>
            ) : (
              <span className={styles.plain}>{p.name}</span>
            )}
          </li>
        ))}
      </ul>

      {!embedded && <div className={styles.veil} data-open={active !== null ? '' : undefined} aria-hidden="true" />}
      {!embedded && current?.image && (
        <figure ref={printRef} className={styles.reveal} data-open={active !== null ? '' : undefined} aria-hidden="true">
          <div className={styles.float}>
            <div className={styles.print}>
              <img
                key={current.image.slug}
                src={`${base}practices/${current.image.slug}.webp`}
                width={current.image.w}
                height={current.image.h}
                alt=""
                decoding="async"
              />
            <figcaption className={styles.label}>
              <span className={styles.eyebrow}>
                {current.name}
                {current.by && <span className={styles.by}>with {current.by}</span>}
              </span>
              <span className={styles.title}>{current.title ?? current.name}</span>
              {current.description && <span className={styles.desc}>{current.description}</span>}
            </figcaption>
            </div>
          </div>
        </figure>
      )}
    </>
  )
}
