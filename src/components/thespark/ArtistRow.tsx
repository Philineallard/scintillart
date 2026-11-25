import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { artistWorkshops, artists, artistsPage } from '../../content/artists'
import { workshops } from '../../content/thespark'
import styles from './ArtistRow.module.css'

const base = import.meta.env.BASE_URL

/** Scattered order in which the portraits appear, as on /thespark-artists (seconds). */
const DELAYS = [0.3, 0.05, 0.5, 0.2, 0.65, 0.4, 0.12]

/** The artists in the order their first workshop appears in chapter 3. */
const ordered = [...artists].sort((a, b) => {
  const first = (ids: string[]) => Math.min(...ids.map((id) => workshops.findIndex((w) => w.id === id)))
  return first(a.workshopIds) - first(b.workshopIds)
})

type Props = { heading: string; more: { label: string; href: string }; tabIndex?: number }

/**
 * Chapter 3 (Igor, 25 November 2026): the workshops as a row of the artists who lead them,
 * after /thespark-artists. Portraits open one by one when the row comes into view; hovering
 * (or focusing) one lifts it and unfolds its workshop description. Touch screens: a row to
 * swipe, descriptions always shown. Each card links to the artist on /thespark-artists.
 */
export function ArtistRow({ heading, more, tabIndex }: Props) {
  const listRef = useRef<HTMLOListElement>(null)

  // Open the portraits once the row is on screen (before JavaScript: simply shown).
  useEffect(() => {
    const list = listRef.current
    if (!list || !('IntersectionObserver' in window)) return
    list.dataset.ready = ''
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        list.dataset.in = ''
        io.disconnect()
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    io.observe(list)
    return () => io.disconnect()
  }, [])

  return (
    <div className={styles.wrap}>
      <h3 className={styles.heading}>{heading}</h3>
      <ol ref={listRef} className={styles.row}>
        {ordered.map((a, i) => {
          const ws = artistWorkshops(a)
          return (
            <li key={a.id} className={styles.cell} style={{ '--delay': `${DELAYS[i % DELAYS.length]}s` } as CSSProperties}>
              <Link to={`${artistsPage.path}#${a.id}`} className={styles.card} tabIndex={tabIndex}>
                <span className={styles.frame}>
                  {a.portrait ? (
                    <img
                      className={styles.img}
                      src={`${base}artists/${a.portrait.slug}-sm.webp`}
                      srcSet={`${base}artists/${a.portrait.slug}-sm.webp 360w, ${base}artists/${a.portrait.slug}.webp 720w`}
                      sizes="(max-width: 900px) 62vw, 14vw"
                      width={360}
                      height={480}
                      alt={a.portrait.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className={styles.placeholder}>{artistsPage.portraitToFollow}</span>
                  )}
                </span>
                <span className={styles.index} aria-hidden="true">
                  ({String(i + 1).padStart(2, '0')})
                </span>
                <span className={styles.titles}>
                  {ws.map((w, k) => (
                    <span key={w.id}>
                      {k > 0 && <span className={styles.dot}> · </span>}
                      {w.practice}
                    </span>
                  ))}
                </span>
                <span className={styles.name}>
                  <span className={styles.with}>with</span> {a.name}
                </span>
                {/* Unfolds on hover or focus; always shown on touch screens. */}
                <span className={styles.more}>
                  <span className={styles.moreInner}>
                    {ws.map((w) => (
                      <span key={w.id} className={styles.text}>
                        {ws.length > 1 && <span className={styles.textLabel}>{w.practice}: </span>}
                        {w.points?.[0] ?? w.text}
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
      <Link to={more.href} className={styles.link} tabIndex={tabIndex}>
        {more.label}
      </Link>
    </div>
  )
}
