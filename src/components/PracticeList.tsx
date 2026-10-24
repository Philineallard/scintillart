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
 * (touch) a practice raises its photo from the bottom of the page, with the artist's
 * name. One photo at a time; it slips back down when the pointer leaves.
 */
export function PracticeList({ practices, embedded = false }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState<number | null>(null) // last photo, kept while it slides away
  const listRef = useRef<HTMLUListElement>(null)

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
                aria-label={p.by ? `${p.name} with ${p.by}: show photo` : `${p.name}: show photo`}
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

      {!embedded && current?.image && (
        <figure className={styles.reveal} data-open={active !== null ? '' : undefined} aria-hidden="true">
          <img
            key={current.image.slug}
            src={`${base}practices/${current.image.slug}.webp`}
            width={current.image.w}
            height={current.image.h}
            alt=""
            decoding="async"
          />
          <figcaption>
            <span className={styles.capName}>{current.name}</span>
            {current.by && <span className={styles.capBy}>with {current.by}</span>}
          </figcaption>
        </figure>
      )}
    </>
  )
}
