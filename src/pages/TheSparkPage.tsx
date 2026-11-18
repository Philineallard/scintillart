import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { BrandGrain } from '../components/thespark/BrandGrain'
import { ChapterBlocks } from '../components/thespark/ChapterBlocks'
import { ChapterNav } from '../components/thespark/ChapterNav'
import { Value } from '../components/thespark/Tba'
import { ThemeToggle } from '../components/thespark/ThemeToggle'
import { Logotype } from '../components/Logotype'
import { brand } from '../content/brand'
import { thespark, type Chapter } from '../content/thespark'
import { useActiveSection } from '../hooks/useActiveSection'
import { useBrandTheme } from '../hooks/useBrandTheme'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import styles from './TheSparkPage.module.css'

const CHAPTER_IDS = thespark.chapters.map((c) => c.id)

type Props = {
  /** Rendered inside the portal transition layer (hidden, inert) rather than as the route. */
  embedded?: boolean
}

function ChapterSection({ chapter, index, next, tabIndex }: { chapter: Chapter; index: number; next?: Chapter; tabIndex?: number }) {
  const headingId = `${chapter.id}-title`
  return (
    <section id={chapter.id} className={styles.chapter} aria-labelledby={headingId}>
      <div className={styles.chapterHead}>
        <p className={styles.chapterLabel}>
          <span className={styles.chapterNum}>{String(index + 1).padStart(2, '0')}</span>
          {chapter.nav}
        </p>
        <h2 id={headingId} className={styles.h2}>
          {chapter.title}
        </h2>
        {chapter.lead && (
          <p className={styles.lead}>
            <Value value={chapter.lead} />
          </p>
        )}
      </div>
      <div className={styles.chapterBody}>
        <ChapterBlocks blocks={chapter.blocks} tabIndex={tabIndex} />
        {(chapter.closing || next) && (
          <div className={styles.chapterEnd}>
            {chapter.closing && <p className={styles.closing}>{chapter.closing}</p>}
            {next && (
              <a href={`#${next.id}`} className={styles.nextLink} tabIndex={tabIndex}>
                <span className={styles.nextLabel}>{thespark.ui.next}</span>
                {next.nav}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * /thespark: The Spark, one immersive scroll in eight anchored chapters, then the
 * call to register interest. Brand Guidelines v2.0 (src/styles/brand.css), light and
 * dark themes. All copy comes from src/content/thespark.ts.
 */
export default function TheSparkPage({ embedded = false }: Props) {
  const live = !embedded
  useDocumentTitle(thespark.meta.title, live)
  useSmoothScroll(live)
  const { theme, setTheme } = useBrandTheme(live)
  const active = useActiveSection(CHAPTER_IDS, live)
  const tab = embedded ? -1 : undefined
  const { hero, ui } = thespark
  // Inside the portal layer the page sits within the homepage's <main>: no second landmark.
  const Main = embedded ? 'div' : 'main'

  // Anchored chapters stop just below the sticky header, whatever its height (it wraps on narrow screens).
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const header = headerRef.current
    if (!live || !header) return
    const root = document.documentElement.style
    const ro = new ResizeObserver(() => root.setProperty('--header-h', `${header.offsetHeight}px`))
    ro.observe(header)
    return () => {
      ro.disconnect()
      root.removeProperty('--header-h')
    }
  }, [live])

  // Arriving in-app at /thespark#chapter (e.g. via the /venue redirect): go to that chapter.
  const { hash } = useLocation()
  useEffect(() => {
    if (!live || !hash) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    // Measure the header now: this can run before the ResizeObserver's first report.
    if (headerRef.current) document.documentElement.style.setProperty('--header-h', `${headerRef.current.offsetHeight}px`)
    target?.scrollIntoView({ block: 'start' })
  }, [live, hash])

  return (
    <div className={styles.page} {...(live ? { 'data-brand-root': '' } : {})}>
      {live && <BrandGrain />}
      {live && (
        <a href="#main" className={styles.skip}>
          {ui.skip}
        </a>
      )}

      <header ref={headerRef} className={styles.header}>
        <Link to="/" className={styles.home} aria-label={ui.home} tabIndex={tab}>
          <Logotype />
        </Link>
        <ChapterNav chapters={thespark.chapters} active={active} label={ui.chaptersLabel} tabIndex={tab} />
        <div className={styles.tools}>
          <ThemeToggle
            theme={theme}
            onChange={setTheme}
            label={ui.themeLabel}
            lightLabel={ui.light}
            darkLabel={ui.dark}
            tabIndex={tab}
          />
          <a href="#register" className={`${styles.button} ${styles.headerButton}`} tabIndex={tab}>
            {thespark.interest.label}
          </a>
        </div>
      </header>

      <Main id={embedded ? undefined : 'main'} className={styles.main}>
        <section className={styles.hero} aria-labelledby="thespark-title">
          <p className={styles.kicker}>{hero.kicker}</p>
          <h1 id="thespark-title" className={styles.h1} tabIndex={-1} {...(live ? { 'data-route-heading': '' } : {})}>
            {hero.title}
            <span className={styles.descriptor}>{hero.descriptor}</span>
          </h1>
          <p className={styles.heroLead}>{hero.lead}</p>
          <div className={styles.heroActions}>
            <a href="#register" className={styles.button} tabIndex={tab}>
              {thespark.interest.label}
            </a>
            <a href={hero.explore.href} className={styles.textLink} tabIndex={tab}>
              {hero.explore.label}
            </a>
          </div>
          <p className={styles.heroNote}>{hero.note}</p>
        </section>

        {thespark.chapters.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={i} next={thespark.chapters[i + 1]} tabIndex={tab} />
        ))}

        {/* Step 3 replaces this with the "Register your interest" panel (deep link #register). */}
        <section id="register" className={styles.interest} aria-labelledby="register-title">
          <p className={styles.kicker}>{thespark.interest.kicker}</p>
          <h2 id="register-title" className={styles.h2}>
            {thespark.interest.title}
          </h2>
          <p className={styles.interestBody}>{thespark.interest.body}</p>
          <a href="#register" className={styles.button} tabIndex={tab}>
            {thespark.interest.label}
          </a>
        </section>
      </Main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerMark} aria-label={ui.home} tabIndex={tab}>
          <Logotype />
        </Link>
        <p className={styles.slogan}>{brand.line}</p>
      </footer>
    </div>
  )
}
