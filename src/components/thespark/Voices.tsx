import { useCallback, useEffect, useRef, useState } from 'react'
import { thespark } from '../../content/thespark'
import styles from './Voices.module.css'

/** Time each guest's words stay before the next slide in (long enough to read). */
const SLIDE_MS = 9000

/**
 * Guests' words, straight after the hero (Igor, 25 November 2026).
 *
 * A slider (Philine, 28 November 2026): the words slide on to the next guest by themselves,
 * and arrows let people go through them faster. It pauses while hovered or focused, while
 * off screen, and with the pause button; with reduced motion it never moves by itself.
 *
 * Without JavaScript (and in the server-rendered markup) the quotes are a plain list of rows.
 */
export function Voices() {
  const { kicker, title, items, previous, next, pause, play } = thespark.voices
  const sectionRef = useRef<HTMLElement>(null)
  const touchX = useRef(0)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false) // pause button
  const [held, setHeld] = useState(false) // hover or keyboard focus inside
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReady(true)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReduced(motion.matches)
    onMotion()
    motion.addEventListener('change', onMotion)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 })
    if (sectionRef.current) io.observe(sectionRef.current)
    return () => {
      motion.removeEventListener('change', onMotion)
      io.disconnect()
    }
  }, [])

  const go = useCallback(
    (step: 1 | -1) => {
      setDir(step)
      setActive((a) => (a + step + items.length) % items.length)
    },
    [items.length],
  )

  const running = ready && visible && !paused && !held && !reduced

  // Auto-advance: restarts whenever the slide changes, so an arrow click gives the full time.
  useEffect(() => {
    if (!running) return
    const t = window.setTimeout(() => go(1), SLIDE_MS)
    return () => window.clearTimeout(t)
  }, [running, active, go])

  return (
    <section
      ref={sectionRef}
      className={styles.voices}
      aria-labelledby="voices-title"
      aria-roledescription="carousel"
      data-slider={ready ? '' : undefined}
      // Mouse hover pauses (touch taps don't), and on phones a swipe changes the words.
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHeld(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (ready && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
      onFocus={(e) => e.target.matches(':focus-visible') && setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false)
      }}
    >
      <div className={styles.panel}>
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>{kicker}</p>
            <h2 id="voices-title" className={styles.title}>
              {title}
            </h2>
          </div>
          {ready && (
            <div className={styles.controls}>
              <p className={styles.counter} aria-hidden="true">
                <span>
                  <span className={styles.counterNow}>{String(active + 1).padStart(2, '0')}</span> /{' '}
                  {String(items.length).padStart(2, '0')}
                </span>
                <span className={styles.bar}>
                  {/* Fills while the slide is shown; restarts on each slide. */}
                  <span
                    key={active}
                    className={styles.barFill}
                    data-running={running ? '' : undefined}
                    style={{ animationDuration: `${SLIDE_MS}ms` }}
                  />
                </span>
              </p>
              <div className={styles.buttons}>
                {!reduced && (
                  <button
                    type="button"
                    className={styles.arrow}
                    onClick={() => setPaused((p) => !p)}
                    aria-label={paused ? play : pause}
                    aria-pressed={paused}
                  >
                    {paused ? (
                      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                        <path d="M6 4l10 6-10 6z" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                        <path d="M6 4h3v12H6zM11 4h3v12h-3z" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                )}
                <button type="button" className={styles.arrow} onClick={() => go(-1)} aria-label={previous}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M20 12H4M10 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  </svg>
                </button>
                <button type="button" className={styles.arrow} onClick={() => go(1)} aria-label={next}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        {/* One quote per row: the guest's opening words set large, the rest beneath. */}
        <ol className={styles.list} aria-live={running ? 'off' : 'polite'}>
          {items.map((q, i) => {
            const state = i === active ? 'now' : (i - active) * dir > 0 ? 'next' : 'past'
            return (
              <li
                key={q.name}
                className={styles.item}
                data-state={ready ? state : undefined}
                aria-hidden={ready && i !== active ? true : undefined}
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${items.length}`}
              >
                <figure className={styles.figure}>
                  <figcaption className={styles.by}>
                    <span className={styles.number} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.name}>{q.name}</span>
                    {q.role ? <span className={styles.role}>{q.role}</span> : null}
                  </figcaption>
                  <blockquote className={styles.text}>
                    <p>
                      <span className={styles.lead}>“{q.lead}</span> {q.text.slice(q.lead.length).trim()}”
                    </p>
                  </blockquote>
                </figure>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
