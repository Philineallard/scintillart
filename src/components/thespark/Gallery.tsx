import { useCallback, useEffect, useRef, useState } from 'react'
import { thespark } from '../../content/thespark'
import styles from './Gallery.module.css'

const base = import.meta.env.BASE_URL

type Item = { name: string; alt: string }

type Props = {
  label: string
  items: readonly Item[]
  /** Folder under public/thespark/ holding <name>.webp (900w) and <name>-sm.webp (540w), 4:5. */
  folder: string
  /** 3: three in view, full width of the chapter (venue). 1: one in view, inside a room card. */
  perView?: 1 | 3
  /** A very slow continuous drift (venue only). Off under reduced motion; pauses on hover, focus or touch, and off screen. */
  drift?: boolean
  /** Photos zoom in slowly while the cursor is on them (inside their frame). */
  zoom?: boolean
  tabIndex?: number
}

const DRIFT_PX_PER_S = 14

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 40 12" width="40" height="12" aria-hidden="true" className={styles.arrowSvg}>
      {dir === 'next' ? (
        <path d="M0 6h38M33 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
      ) : (
        <path d="M40 6H2M7 1L2 6l5 5" fill="none" stroke="currentColor" strokeWidth="1" />
      )}
    </svg>
  )
}

/**
 * A sliding row of photos. Arrows step one photo at a time; the row can also be swiped.
 * With `drift`, the photos move very slowly on their own in an endless loop (the set is
 * repeated once, the copy hidden from assistive technology). Rendered without browser
 * APIs so /thespark can be pre-rendered.
 */
export function Gallery({ label, items, folder, perView = 3, drift = false, zoom = false, tabIndex }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const [index, setIndex] = useState(0)
  const [driftOn, setDriftOn] = useState(false)
  const count = items.length

  const slideWidth = () => {
    const el = track.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return 1
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    return first.offsetWidth + gap
  }

  const onScroll = useCallback(() => {
    const el = track.current
    if (!el) return
    const w = slideWidth()
    setIndex(Math.round(el.scrollLeft / w) % count)
  }, [count])

  useEffect(() => {
    const el = track.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  // The slow drift: a requestAnimationFrame loop that only runs while the row is on screen.
  useEffect(() => {
    const el = track.current
    if (!drift || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setDriftOn(true)
    let raf = 0
    let last = 0
    let visible = false
    let pos = el.scrollLeft
    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 64) : 0
      last = t
      if (!paused.current) {
        const half = el.scrollWidth / 2
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft // the visitor moved it
        pos += (DRIFT_PX_PER_S * dt) / 1000
        if (pos >= half) pos -= half
        el.scrollLeft = pos
      } else {
        pos = el.scrollLeft
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(raf)
      last = 0
      if (visible) raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [drift])

  const step = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const w = slideWidth()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let target = Math.round(el.scrollLeft / w + dir) * w
    if (driftOn) {
      const half = el.scrollWidth / 2
      if (target < 0) {
        el.scrollLeft += half
        target += half
      }
    } else {
      const max = el.scrollWidth - el.clientWidth
      if (target > max + 1) target = 0
      if (target < -1) target = max
    }
    el.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' })
  }

  const pause = () => (paused.current = true)
  const resume = () => (paused.current = false)
  const slides = driftOn ? [...items, ...items] : items
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      className={`${styles.gallery} ${perView === 3 ? styles.wide : styles.single}${zoom ? ` ${styles.zoom}` : ''}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      {...(perView === 3 ? { 'data-wide-gallery': '' } : {})}
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={pause}
      onTouchEnd={() => setTimeout(resume, 4000)}
    >
      <div ref={track} className={`${styles.track}${driftOn ? ` ${styles.drifting}` : ''}`}>
        {slides.map((it, i) => (
          <figure key={`${it.name}-${i}`} className={styles.slide} aria-hidden={i >= count ? true : undefined}>
            <img
              className={styles.img}
              src={`${base}thespark/${folder}/${it.name}.webp`}
              srcSet={`${base}thespark/${folder}/${it.name}-sm.webp 540w, ${base}thespark/${folder}/${it.name}.webp 900w`}
              sizes={perView === 3 ? '(max-width: 720px) 80vw, 31vw' : '(max-width: 720px) 92vw, 22rem'}
              alt={i >= count ? '' : it.alt}
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
      <div className={styles.controls}>
        <span className={styles.counter} aria-hidden="true">
          {pad(index + 1)} <span className={styles.counterOf}>/ {pad(count)}</span>
        </span>
        <span className={styles.rule} aria-hidden="true">
          <span className={styles.ruleFill} style={{ width: `${((index + 1) / count) * 100}%` }} />
        </span>
        <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label={thespark.ui.galleryPrev} tabIndex={tabIndex}>
          <Arrow dir="prev" />
        </button>
        <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label={thespark.ui.galleryNext} tabIndex={tabIndex}>
          <Arrow dir="next" />
        </button>
      </div>
    </div>
  )
}
