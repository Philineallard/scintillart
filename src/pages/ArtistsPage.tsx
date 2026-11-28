import { useEffect, useRef, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { BrandGrain } from '../components/thespark/BrandGrain'
import { Slogan } from '../components/thespark/Slogan'
import { Value } from '../components/thespark/Tba'
import { ThemeToggle } from '../components/thespark/ThemeToggle'
import { Logotype } from '../components/Logotype'
import { brand } from '../content/brand'
import { artistWorkshops, artists, artistsPage, type Artist } from '../content/artists'
import { thespark, workshops } from '../content/thespark'
import { useBrandTheme } from '../hooks/useBrandTheme'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useReveal } from '../hooks/useReveal'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import pageStyles from './TheSparkPage.module.css'
import styles from './ArtistsPage.module.css'

const base = import.meta.env.BASE_URL

/** Scattered order in which the portraits appear on load (seconds), after the reference's reveal. */
const REVEAL_DELAYS = [0.35, 0.1, 0.6, 0.25, 0.75, 0.45, 0.15]

const num = (i: number) => `(${String(i + 1).padStart(2, '0')})`

function Portrait({ artist, size }: { artist: Artist; size: 'sm' | 'lg' }) {
  if (!artist.portrait) {
    return (
      <span className={styles.placeholder}>
        <span className={styles.placeholderText}>{artistsPage.portraitToFollow}</span>
      </span>
    )
  }
  const { slug, alt } = artist.portrait
  return (
    <img
      className={styles.img}
      src={`${base}artists/${slug}${size === 'sm' ? '-sm' : ''}.webp`}
      srcSet={`${base}artists/${slug}-sm.webp 360w, ${base}artists/${slug}.webp 720w`}
      sizes={size === 'sm' ? '(max-width: 720px) 42vw, 240px' : '(max-width: 900px) 92vw, 40vw'}
      width={size === 'sm' ? 360 : 720}
      height={size === 'sm' ? 480 : 960}
      alt={alt}
      loading={size === 'sm' ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

/**
 * /thespark-artists: the artists of The Spark. A one-screen cover in the manner of an
 * editorial portfolio (a row of portraits that appear one by one; hovering one lifts it
 * with its number and caption), then a chapter per artist, then the workshop photographs.
 * Text in src/content/artists.ts; workshops shared with /thespark.
 */
export default function ArtistsPage() {
  useDocumentTitle(artistsPage.meta.title)
  useSmoothScroll()
  const { theme, setTheme } = useBrandTheme()
  const pageRef = useRef<HTMLDivElement>(null)
  useReveal(pageRef)
  const { ui } = thespark
  const p = artistsPage

  // Anchors stop just below the sticky bar.
  const barRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const root = document.documentElement.style
    const ro = new ResizeObserver(() => root.setProperty('--header-h', `${bar.offsetHeight}px`))
    ro.observe(bar)
    return () => {
      ro.disconnect()
      root.removeProperty('--header-h')
    }
  }, [])

  // Arriving in-app at /thespark-artists#<artist> (e.g. from a workshop on /thespark): go to that artist.
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    // Measure the bar now: this can run before the ResizeObserver's first report.
    if (barRef.current) document.documentElement.style.setProperty('--header-h', `${barRef.current.offsetHeight}px`)
    target?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div ref={pageRef} className={`${pageStyles.page} ${styles.page}`} data-brand-root="">
      <BrandGrain />

      <header ref={barRef} className={styles.bar}>
        <Link to="/" className={styles.home} aria-label={ui.home}>
          <Logotype />
        </Link>
        <nav className={styles.barNav} aria-label={p.title}>
          <Link to={thespark.path} className={styles.barLink}>
            {p.bar.retreat}
          </Link>
          <a href="#top" className={styles.barLink} aria-current="page">
            {p.bar.current}
          </a>
          <a href="#workshops" className={styles.barLink}>
            {p.bar.workshops}
          </a>
        </nav>
        <div className={styles.barTools}>
          <ThemeToggle theme={theme} onChange={setTheme} label={ui.themeLabel} lightLabel={ui.light} darkLabel={ui.dark} />
        </div>
      </header>

      <main id="top" className={styles.main}>
        <section className={styles.cover} aria-labelledby="artists-title">
          <div className={styles.coverText}>
            <h1 id="artists-title" className={styles.title} tabIndex={-1} data-route-heading="">
              {p.title}
            </h1>
            <p className={styles.lead}>{p.lead}</p>
          </div>

          <ol className={styles.row}>
            {artists.map((a, i) => (
              <li key={a.id} className={styles.cell} style={{ '--delay': `${REVEAL_DELAYS[i % REVEAL_DELAYS.length]}s` } as CSSProperties}>
                <a href={`#${a.id}`} className={styles.card}>
                  <span className={styles.index} aria-hidden="true">
                    {num(i)}
                  </span>
                  <span className={styles.frame}>
                    <Portrait artist={a} size="sm" />
                  </span>
                  <span className={styles.caption}>
                    <span className={styles.captionName}>{a.name}</span>
                    <span className={styles.captionRole}>{artistWorkshops(a)[0]?.practice ?? a.role}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>

          <a href="#workshops" className={styles.plus} aria-label={p.bar.workshops}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
              <path d="M8 1v14M1 8h14" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
        </section>

        {artists.map((a, i) => {
          const next = artists[i + 1]
          return (
            <section key={a.id} id={a.id} className={styles.artist} aria-labelledby={`${a.id}-name`}>
              <figure className={styles.artistPhoto} data-reveal="">
                <Portrait artist={a} size="lg" />
              </figure>
              <div className={styles.artistText}>
                <p className={styles.artistIndex}>{num(i)}</p>
                <h2 id={`${a.id}-name`} className={styles.artistName}>
                  {a.name}
                </h2>
                <p className={styles.artistRole}>{a.role}</p>
                {a.bio.map((para, k) => (
                  <p key={k} className={styles.bio}>
                    <Value value={para} />
                  </p>
                ))}
                {a.quote && (
                  <blockquote className={styles.quote}>
                    <p>{a.quote}</p>
                  </blockquote>
                )}
                <ul className={styles.workshops}>
                  {artistWorkshops(a).map((w) => (
                    <li key={w.id} className={styles.workshop}>
                      <h3 className={styles.workshopName}>
                        {w.practice}
                        {w.title && <span className={styles.workshopTitle}>{w.title}</span>}
                      </h3>
                      {w.points ? (
                        <ul className={styles.workshopPoints}>
                          {w.points.map((pt) => (
                            <li key={pt} className={styles.workshopText}>
                              {pt}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.workshopText}>{w.text}</p>
                      )}
                      {w.description?.map((para) => (
                        <p key={para} className={styles.workshopText}>
                          {para}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
                <p className={styles.artistNav}>
                  <a href="#top" className={styles.textLink}>
                    {p.back}
                  </a>
                  {next && (
                    <a href={`#${next.id}`} className={styles.textLink}>
                      {p.next}: {next.name}
                    </a>
                  )}
                </p>
              </div>
            </section>
          )
        })}

        <section id="workshops" className={styles.gallery} aria-labelledby="workshops-title">
          <div className={styles.galleryHead}>
            <h2 id="workshops-title" className={styles.galleryTitle}>
              {p.workshopsHeading}
            </h2>
            <p className={styles.lead}>{p.workshopsLead}</p>
          </div>
          <ul className={styles.galleryGrid}>
            {workshops.map((w, i) => (
              <li key={w.id} className={styles.galleryItem}>
                <figure className={styles.galleryFigure}>
                  <span className={styles.galleryFrame} data-reveal="" style={{ aspectRatio: `${w.photo.w} / ${w.photo.h}` }}>
                    <img
                      className={styles.img}
                      src={`${base}practices/${w.photo.slug}.webp`}
                      width={w.photo.w}
                      height={w.photo.h}
                      alt={w.photo.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <figcaption className={styles.galleryCaption}>
                    <span className={styles.galleryIndex}>{num(i)}</span> {w.practice}
                    {w.title ? `: ${w.title}` : ''} · {w.by}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.closing} aria-labelledby="artists-closing">
          <h2 id="artists-closing" className={styles.closingTitle}>
            {p.closingTitle}
          </h2>
          <Link to={`${thespark.path}#register`} className={pageStyles.button}>
            {p.register}
          </Link>
        </section>
      </main>

      <footer className={pageStyles.footer}>
        <Link to="/" className={pageStyles.footerMark} aria-label={ui.home}>
          <Logotype />
        </Link>
        <Slogan text={brand.line} className={pageStyles.slogan} />
        <Link to="/privacy" className={pageStyles.footerLink}>
          {thespark.register.fields.privacy}
        </Link>
      </footer>
    </div>
  )
}
