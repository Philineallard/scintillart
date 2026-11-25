import { useEffect, useRef, useState } from 'react'
import { thespark } from '../../content/thespark'
import styles from './Voices.module.css'

/**
 * Guests' words, straight after the hero (Igor, 25 November 2026).
 *
 * Pinned: the heading stays in place while the four quotes replace one another as the page
 * scrolls, then the page moves on. Scroll speed is never changed (no hijacking): the section is
 * simply taller than the screen and its panel is `position: sticky`.
 *
 * Falls back to the plain list of rows (also the server-rendered markup) when motion is
 * reduced, without JavaScript, or when the tallest quote would not fit on the screen.
 */
export function Voices() {
  const { kicker, title, items } = thespark.voices
  const sectionRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(false)
  const [active, setActive] = useState(0)

  // Decide whether the pinned version fits: re-checked on resize.
  useEffect(() => {
    const section = sectionRef.current
    const panel = panelRef.current
    if (!section || !panel) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const check = () => {
      if (motion.matches) return setPinned(false)
      // Measure the panel as it would be pinned: its natural height must fit the space below the header.
      section.dataset.measure = ''
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72
      const fits = panel.scrollHeight <= window.innerHeight - header
      delete section.dataset.measure
      setPinned(fits)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(document.documentElement)
    motion.addEventListener('change', check)
    return () => {
      ro.disconnect()
      motion.removeEventListener('change', check)
    }
  }, [])

  // While pinned: the scroll position through the section picks the quote shown.
  useEffect(() => {
    const section = sectionRef.current
    if (!pinned || !section) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const progress = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0
      setActive(Math.min(items.length - 1, Math.floor(progress * items.length)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [pinned, items.length])

  return (
    <section
      ref={sectionRef}
      className={styles.voices}
      aria-labelledby="voices-title"
      data-pinned={pinned ? '' : undefined}
      style={{ '--count': items.length } as React.CSSProperties}
    >
      <div ref={panelRef} className={styles.panel}>
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>{kicker}</p>
            <h2 id="voices-title" className={styles.title}>
              {title}
            </h2>
          </div>
          {pinned && (
            <p className={styles.counter} aria-hidden="true">
              <span>
                <span className={styles.counterNow}>{String(active + 1).padStart(2, '0')}</span> /{' '}
                {String(items.length).padStart(2, '0')}
              </span>
              <span className={styles.bar}>
                <span className={styles.barFill} style={{ transform: `scaleX(${(active + 1) / items.length})` }} />
              </span>
            </p>
          )}
        </div>
        {/* One quote per row: the guest's opening words set large, the rest beneath. */}
        <ol className={styles.list}>
          {items.map((q, i) => (
            <li
              key={q.name}
              className={styles.item}
              data-state={pinned ? (i === active ? 'now' : i < active ? 'past' : 'next') : undefined}
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
          ))}
        </ol>
      </div>
    </section>
  )
}
