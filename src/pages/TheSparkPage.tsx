import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { parseRegisterHash, RegisterButton, RegisterContext, registerHash, type OpenRegister } from '../components/thespark/register'
import { RegisterPanel } from '../components/thespark/RegisterPanel'
import { BrandGrain } from '../components/thespark/BrandGrain'
import { EnvelopeGate } from '../components/thespark/EnvelopeGate'
import { ChapterBlocks } from '../components/thespark/ChapterBlocks'
import { ChapterNav } from '../components/thespark/ChapterNav'
import { Spread } from '../components/thespark/Spread'
import { Value } from '../components/thespark/Tba'
import { ThemeToggle } from '../components/thespark/ThemeToggle'
import { Logotype } from '../components/Logotype'
import { brand } from '../content/brand'
import { thespark, type Block, type Chapter, type ChapterPhoto, type RoomId } from '../content/thespark'
import { useActiveSection } from '../hooks/useActiveSection'
import { useBrandTheme } from '../hooks/useBrandTheme'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import styles from './TheSparkPage.module.css'

const CHAPTER_IDS = thespark.chapters.map((c) => c.id)
const base = import.meta.env.BASE_URL

type Props = {
  /** Rendered inside the portal transition layer (hidden, inert) rather than as the route. */
  embedded?: boolean
}

type Segment = { wide: false; blocks: Block[] } | { wide: true; block: Block }

/** Full-width blocks get a row of their own: the galleries, the guest quotes and the room cards. */
const isWide = (b: Block) => b.type === 'gallery' || b.type === 'rooms' || b.type === 'quotes'

/** Splits blocks into runs of text (beside the heading) and full-width rows. */
function segmentsOf(blocks: readonly Block[]): Segment[] {
  const out: Segment[] = []
  for (const b of blocks) {
    if (isWide(b)) out.push({ wide: true, block: b })
    else {
      const last = out[out.length - 1]
      if (last && !last.wide) last.blocks.push(b)
      else out.push({ wide: false, blocks: [b] })
    }
  }
  return out
}

function PhotoImg({ photo, className, sizes }: { photo: ChapterPhoto; className: string; sizes: string }) {
  return (
    <img
      className={className}
      src={`${base}thespark/${photo.name}.webp`}
      srcSet={`${base}thespark/${photo.name}-sm.webp 720w, ${base}thespark/${photo.name}-md.webp 1100w, ${base}thespark/${photo.name}.webp ${photo.width}w`}
      sizes={sizes}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      style={{ objectPosition: photo.focus, ...(photo.pushRight ? { ['--push' as string]: photo.pushRight } : {}) }}
      data-push={photo.pushRight ? '' : undefined}
      loading="lazy"
      decoding="async"
    />
  )
}

/**
 * The chapter's number, title and standfirst. The first one on the page is the real
 * heading; a later repeat (a pinned panel after a band) is a visual copy, hidden from
 * assistive technology and from the document outline.
 */
function ChapterHeading({ chapter, index, headingId, copy = false }: { chapter: Chapter; index: number; headingId: string; copy?: boolean }) {
  const Title = copy ? 'p' : 'h2'
  return (
    <div className={copy ? styles.headingCopy : undefined} aria-hidden={copy || undefined}>
      <p className={styles.chapterLabel}>
        <span className={styles.chapterNum}>{String(index + 1).padStart(2, '0')}</span>
        {chapter.nav}
      </p>
      <Title id={copy ? undefined : headingId} className={styles.h2}>
        {chapter.title}
      </Title>
      {chapter.lead && (
        <p className={styles.lead}>
          <Value value={chapter.lead} />
        </p>
      )}
    </div>
  )
}

/**
 * One chapter, built in rows (editorial layout, CLAUDE.md):
 * - band: a full-width photo with the heading on it, at the top;
 * - spread: a full-width row of videos, before the text;
 * - text rows (.zone): heading pinned on the left, text on the right;
 * - wide rows: galleries and room cards, the full width;
 * - panel: a photo with the heading on it, pinned on one side while the text scrolls.
 * The heading is pinned only within its own row, so it never runs over a photo.
 */
function ChapterSection({ chapter, index, next, tabIndex }: { chapter: Chapter; index: number; next?: Chapter; tabIndex?: number }) {
  const headingId = `${chapter.id}-title`
  const { band, panel, spread } = chapter
  const from = panel ? (panel.fromBlock ?? 0) : chapter.blocks.length
  const segments = segmentsOf(chapter.blocks.slice(0, from))
  const panelBlocks = panel ? chapter.blocks.slice(from) : []
  let placed = (Boolean(band) && !band?.plain) || Boolean(chapter.headingAbove)
  const lastText = panel ? -1 : segments.map((g) => !g.wide).lastIndexOf(true)

  const end = (chapter.closing || next) && (
    <div className={styles.chapterEnd}>
      {chapter.closing && (
        <p className={styles.closing}>
          {chapter.closing}
          {chapter.closingRegister && (
            <>
              {' '}
              <RegisterButton className={styles.closingLink} tabIndex={tabIndex}>
                {chapter.closingRegister}
              </RegisterButton>
            </>
          )}
        </p>
      )}
      {next && (
        <a href={`#${next.id}`} className={styles.nextLink} tabIndex={tabIndex}>
          <span className={styles.nextLabel}>{thespark.ui.next}</span>
          {next.nav}
        </a>
      )}
    </div>
  )

  const flush = Boolean(band) || (panel && from === 0 && !chapter.headingAbove)
  const side = panel?.side ?? 'left'

  return (
    <section id={chapter.id} className={flush ? `${styles.chapter} ${styles.chapterFlush}` : styles.chapter} aria-labelledby={headingId}>
      {band && (
        <div className={styles.band}>
          <PhotoImg photo={band} className={styles.photoFill} sizes="100vw" />
          {!band.plain && (
            <div className={styles.photoText}>
              <ChapterHeading chapter={chapter} index={index} headingId={headingId} />
            </div>
          )}
        </div>
      )}

      {chapter.headingAbove && (
        <div className={styles.headingAbove}>
          <ChapterHeading chapter={chapter} index={index} headingId={headingId} />
        </div>
      )}

      {/* The videos are left out on phones (Philine, November 2026). */}
      {spread && (
        <div className={`${styles.wideRow} ${styles.noPhone}`}>
          <Spread figures={spread} />
        </div>
      )}

      {segments.map((seg, i) => {
        if (seg.wide) {
          return (
            <div key={i} className={styles.wideRow}>
              <ChapterBlocks blocks={[seg.block]} tabIndex={tabIndex} />
            </div>
          )
        }
        const withHead = !placed
        const withCopy = placed && (chapter.repeatHeading === true || (chapter.repeatHeading === 'afterRows' && i > 0 && segments[i - 1].wide))
        placed = true
        return (
          <div key={i} className={styles.zone}>
            {(withHead || withCopy) && (
              <div className={styles.chapterHead}>
                <ChapterHeading chapter={chapter} index={index} headingId={headingId} copy={!withHead} />
              </div>
            )}
            <div className={chapter.textLeft && !withHead && !withCopy ? `${styles.chapterBody} ${styles.chapterBodyLeft}` : styles.chapterBody}>
              <ChapterBlocks blocks={seg.blocks} tabIndex={tabIndex} />
              {i === lastText && end}
            </div>
          </div>
        )
      })}

      {panel && (
        <div className={`${styles.zone} ${side === 'right' ? styles.panelZoneRight : styles.panelZoneLeft}`}>
          <div className={`${styles.panel}${panel.textAt === 'top' ? ` ${styles.panelTop}` : ''}`}>
            <PhotoImg photo={panel} className={styles.photoFill} sizes="(max-width: 900px) 100vw, 50vw" />
            <div className={styles.photoText}>
              <ChapterHeading chapter={chapter} index={index} headingId={headingId} copy={placed} />
            </div>
          </div>
          <div className={styles.panelBody}>
            <ChapterBlocks blocks={panelBlocks} tabIndex={tabIndex} />
            {end}
          </div>
        </div>
      )}

      {!panel && lastText === -1 && end && (
        <div className={styles.zone}>
          <div className={styles.chapterBody}>{end}</div>
        </div>
      )}
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
  const lenis = useSmoothScroll(live)
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

  // ---------- "Register your interest" panel ----------
  const [register, setRegister] = useState<{ open: boolean; room: RoomId | undefined }>({ open: false, room: undefined })
  const openerRef = useRef<HTMLElement | null>(null)

  // The URL mirrors the panel (#register or #register?room=<id>) without moving the page:
  // history.replaceState, keeping the router's own state.
  const setHash = (next: string) => {
    const { pathname, search } = window.location
    window.history.replaceState(window.history.state, '', `${pathname}${search}${next}`)
  }

  const openRegister = useCallback<OpenRegister>((room, opener) => {
    openerRef.current = opener
    setRegister({ open: true, room })
    setHash(registerHash(room))
  }, [])

  const closeRegister = useCallback(() => {
    setRegister((r) => ({ ...r, open: false }))
    setHash('')
  }, [])

  // Arriving at /thespark#register (or the hash changing to it): open the panel.
  useEffect(() => {
    if (!live) return
    const fromHash = () => {
      const parsed = parseRegisterHash(window.location.hash)
      if (parsed) {
        openerRef.current = null
        setRegister({ open: true, room: parsed.room })
      }
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [live])

  // While open: the page behind doesn't scroll. On close: focus back to the button that opened it.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (!live) return
    const root = document.documentElement
    if (register.open) {
      lenis.current?.stop()
      root.style.overflow = 'hidden'
    } else if (wasOpen.current) {
      lenis.current?.start()
      root.style.overflow = ''
      openerRef.current?.focus({ preventScroll: true })
    }
    wasOpen.current = register.open
  }, [live, register.open, lenis])

  return (
    <RegisterContext.Provider value={live ? openRegister : null}>
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
          <RegisterButton className={`${styles.button} ${styles.headerButton}`} tabIndex={tab}>
            {thespark.interest.label}
          </RegisterButton>
        </div>
      </header>

      <Main id={embedded ? undefined : 'main'} className={styles.main}>
        <section className={`${styles.hero} ${styles.heroPhoto}`} aria-labelledby="thespark-title">
          <img
            className={styles.heroImage}
            src={`${base}thespark/${hero.image.name}.webp`}
            srcSet={`${base}thespark/${hero.image.name}-sm.webp 720w, ${base}thespark/${hero.image.name}-md.webp 1100w, ${base}thespark/${hero.image.name}.webp ${hero.image.width}w`}
            sizes="(max-aspect-ratio: 16/9) 180svh, 100vw"
            alt={hero.image.alt}
            width={hero.image.width}
            height={hero.image.height}
            style={{ objectPosition: hero.image.focus }}
            fetchPriority="high"
            decoding="async"
          />
          <p className={styles.kicker}>{hero.kicker}</p>
          <h1 id="thespark-title" className={styles.h1} tabIndex={-1} {...(live ? { 'data-route-heading': '' } : {})}>
            {hero.title}
            <span className={styles.descriptor}>{hero.descriptor}</span>
          </h1>
          <p className={styles.heroLead}>{hero.lead}</p>
          <div className={styles.heroActions}>
            <RegisterButton className={styles.button} tabIndex={tab}>
              {thespark.interest.label}
            </RegisterButton>
            <a href={hero.explore.href} className={styles.textLink} tabIndex={tab}>
              {hero.explore.label}
            </a>
          </div>
          <p className={styles.heroNote}>{hero.note}</p>
        </section>

        {thespark.chapters.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={i} next={thespark.chapters[i + 1]} tabIndex={tab} />
        ))}

        {/* Closing banner: the envelope photograph opens the register panel (Igor, November 2026). */}
        <EnvelopeGate tabIndex={tab} lenis={lenis} />
      </Main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerMark} aria-label={ui.home} tabIndex={tab}>
          <Logotype />
        </Link>
        <p className={styles.slogan}>{brand.line}</p>
        <Link to="/privacy" className={styles.footerLink} tabIndex={tab}>
          {thespark.register.fields.privacy}
        </Link>
      </footer>

      {live && <RegisterPanel open={register.open} room={register.room} onClose={closeRegister} />}
    </div>
    </RegisterContext.Provider>
  )
}
