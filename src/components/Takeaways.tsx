import { useEffect, useId, useState } from 'react'
import styles from './Takeaways.module.css'

type Props = {
  title: string
  /** Small note under the title, e.g. where the words come from. */
  caption?: string
  items: readonly string[]
  /** Rotate automatically (off inside the hidden transition layer and for reduced motion). */
  autoplay: boolean
  /** Inside the inert transition layer: no focusable controls. */
  embedded?: boolean
}

const INTERVAL_MS = 3600

/** Deterministic spark positions per item, so each change sparkles in a different place. */
function sparks(seed: number) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  return Array.from({ length: 5 }, (_, n) => ({
    left: `${4 + rand(n) * 88}%`,
    top: `${-12 + rand(n + 9) * 112}%`,
    size: 0.45 + rand(n + 17) * 0.6,
    delay: n * 0.11 + rand(n + 23) * 0.2,
  }))
}

/**
 * One takeaway at a time: the line arrives with a single light sweep and a few
 * sparks, then gives way to the next. All items stay in the list for screen readers;
 * rotation pauses on hover, on focus, with the pause button, and for reduced motion
 * (which gets previous/next only).
 */
export function Takeaways({ title, caption, items, autoplay, embedded = false }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false) // hover or focus inside
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const titleId = useId()
  const n = items.length
  const playing = autoplay && !reduced && !paused && !held

  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % n), INTERVAL_MS)
    return () => window.clearTimeout(t)
  }, [playing, index, n])

  const go = (d: number) => setIndex((i) => (i + d + n) % n)
  const tab = embedded ? -1 : undefined

  return (
    <section
      className={styles.takeaways}
      aria-labelledby={titleId}
      data-reduced={reduced ? '' : undefined}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false)
      }}
    >
      <div className={styles.head}>
        <div>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {caption && <p className={styles.caption}>{caption}</p>}
        </div>
        <span className={styles.count} aria-hidden="true">
          {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
      </div>

      <div className={styles.stage}>
        <ul className={styles.items}>
          {items.map((item, i) => (
            <li key={item} className={styles.item} data-active={i === index ? '' : undefined}>
              <span className={styles.text}>{item}</span>
            </li>
          ))}
        </ul>
        {!reduced && autoplay && (
          <div key={index} className={styles.sparks} aria-hidden="true">
            {sparks(index + 1).map((s, k) => (
              <svg
                key={k}
                className={styles.spark}
                viewBox="0 0 20 20"
                style={{ left: s.left, top: s.top, width: `${s.size}em`, height: `${s.size}em`, animationDelay: `${s.delay}s` }}
              >
                <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.progress} aria-hidden="true">
          <span key={`${index}-${playing}`} className={styles.bar} data-playing={playing ? '' : undefined} />
        </div>
        <button type="button" className={styles.control} onClick={() => go(-1)} aria-label="Previous" tabIndex={tab}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3 L5 8 L10 13" />
          </svg>
        </button>
        {autoplay && !reduced && (
          <button
            type="button"
            className={styles.control}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play' : 'Pause'}
            tabIndex={tab}
          >
            {paused ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3 L12 8 L5 13 Z" className={styles.fill} />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5.5 3 V13 M10.5 3 V13" />
              </svg>
            )}
          </button>
        )}
        <button type="button" className={styles.control} onClick={() => go(1)} aria-label="Next" tabIndex={tab}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3 L11 8 L6 13" />
          </svg>
        </button>
      </div>
    </section>
  )
}
