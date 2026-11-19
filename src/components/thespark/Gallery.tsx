import { useCallback, useEffect, useRef, useState } from 'react'
import { thespark } from '../../content/thespark'
import styles from './Gallery.module.css'

const base = import.meta.env.BASE_URL

type Item = { name: string; alt: string }

/**
 * Three photos in view, sliding left and right: arrow buttons step one view at a time,
 * and the row can also be swiped or scrolled (scroll snap). No autoplay. Rendered without
 * browser APIs so /thespark can be pre-rendered.
 */
export function Gallery({ label, items, tabIndex }: { label: string; items: readonly Item[]; tabIndex?: number }) {
  const track = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const step = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <div className={styles.gallery} role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={track} className={styles.track} data-lenis-prevent-wheel>
        {items.map((it, i) => (
          <figure key={it.name} className={styles.slide} aria-label={`${i + 1} / ${items.length}`}>
            <img
              className={styles.img}
              src={`${base}thespark/venue/${it.name}.webp`}
              srcSet={`${base}thespark/venue/${it.name}-sm.webp 540w, ${base}thespark/venue/${it.name}.webp 900w`}
              sizes="(max-width: 720px) 80vw, 31vw"
              alt={it.alt}
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => step(-1)} disabled={atStart} aria-label={thespark.ui.galleryPrev} tabIndex={tabIndex}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>
        <button type="button" className={styles.arrow} onClick={() => step(1)} disabled={atEnd} aria-label={thespark.ui.galleryNext} tabIndex={tabIndex}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>
      </div>
    </div>
  )
}
