import { useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router'
import actionLinkStyles from '../components/ActionLink.module.css'
import { Logotype } from '../components/Logotype'
import { brand } from '../content/brand'
import { venue, type VenueImage } from '../content/venue'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useParallax } from '../hooks/useParallax'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import styles from './VenuePage.module.css'

const base = import.meta.env.BASE_URL

/** One photograph, cropped by its container (object-fit: cover) and kept on its subject. */
function Photo({ image, eager = false, className }: { image: VenueImage; eager?: boolean; className?: string }) {
  return (
    <img
      className={[styles.photo, className].filter(Boolean).join(' ')}
      src={`${base}venue/${image.slug}.webp`}
      width={image.w}
      height={image.h}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={image.focus ? { objectPosition: image.focus } : undefined}
    />
  )
}

/** A text column beside a tall photograph; `flip` puts the photograph first on wide screens. */
function Chapter({
  label,
  title,
  image,
  flip = false,
  children,
}: {
  label: string
  title: string
  image: VenueImage
  flip?: boolean
  children: ReactNode
}) {
  const id = useId()
  return (
    <section className={styles.chapter} data-flip={flip ? '' : undefined} aria-labelledby={id}>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <h2 id={id} className={styles.heading}>
          {title}
        </h2>
        {children}
      </div>
      <figure className={styles.tall}>
        <Photo image={image} />
      </figure>
    </section>
  )
}

function Pair({ images }: { images: readonly VenueImage[] }) {
  return (
    <figure className={styles.pair}>
      {images.map((image) => (
        <Photo key={image.slug} image={image} />
      ))}
    </figure>
  )
}

function Wide({ image }: { image: VenueImage }) {
  return (
    <figure className={styles.wide}>
      <Photo image={image} />
    </figure>
  )
}

/**
 * /venue: Quinta Javali, the retreat's venue, as a long editorial scroll —
 * arrival, the two houses, shared spaces, grounds and the natural pool, and
 * the property's own architectural plans. Photographs and the written
 * room/amenity facts come from Quinta Javali; captions describe only what
 * is visible in each photograph.
 */
export default function VenuePage() {
  const v = venue
  useDocumentTitle(`${v.eyebrow} · ${brand.name}`)
  useSmoothScroll()
  const banner = useRef<HTMLElement>(null)
  useParallax(banner)

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <Link to="/" className={styles.home} aria-label={`${brand.name}, home`}>
          <Logotype />
        </Link>
        <p className={styles.eyebrow}>{v.eyebrow}</p>
      </header>

      <section className={styles.hero}>
        <figure className={styles.banner} ref={banner}>
          <Photo image={v.heroImage} eager />
        </figure>
        <div className={styles.heroText}>
          <div className={styles.heroTitle}>
            <h1 className={styles.title} tabIndex={-1} data-route-heading="">
              {v.title}
            </h1>
          </div>
          <div className={styles.heroIntro}>
            <p className={styles.line}>{v.line}</p>
            <p className={styles.intro}>{v.intro}</p>
          </div>
        </div>
      </section>

      <Chapter label={v.arrival.label} title={v.arrival.title} image={v.arrival.image}>
        <p className={styles.body}>{v.arrival.body}</p>
      </Chapter>

      <Pair images={v.arrivalPair} />
      <Wide image={v.arrivalWide} />

      <Chapter label={v.houses.label} title={v.houses.title} image={v.houses.image} flip>
        <p className={styles.body}>{v.houses.body}</p>
        <ul className={styles.houseList}>
          {v.houses.houseList.map((h) => (
            <li key={h.title} className={styles.house}>
              <p className={styles.houseTitle}>{h.title}</p>
              <p className={styles.houseDetail}>{h.detail}</p>
            </li>
          ))}
        </ul>
      </Chapter>

      <Pair images={v.bedroomsPair} />
      <Pair images={v.bathsPair} />

      <Chapter label={v.gathering.label} title={v.gathering.title} image={v.gathering.image}>
        <p className={styles.body}>{v.gathering.body}</p>
      </Chapter>

      <Pair images={v.gatheringPair} />
      <Wide image={v.gatheringWide} />

      <Chapter label={v.grounds.label} title={v.grounds.title} image={v.grounds.image} flip>
        <p className={styles.body}>{v.grounds.body}</p>
      </Chapter>

      <Pair images={v.groundsPair} />
      <Wide image={v.groundsWide} />

      <section className={styles.floorplans} aria-labelledby="venue-floorplans">
        <div className={styles.floorplansText}>
          <p className={styles.label}>{v.floorplans.label}</p>
          <h2 id="venue-floorplans" className={styles.heading}>
            {v.floorplans.title}
          </h2>
          <p className={styles.body}>{v.floorplans.body}</p>
        </div>
        <div className={styles.plans}>
          {v.floorplans.plans.map((plan) => (
            <figure key={plan.slug} className={styles.plan}>
              <img
                className={styles.planImage}
                src={`${base}venue/${plan.slug}.webp`}
                width={plan.w}
                height={plan.h}
                alt={plan.alt}
                loading="lazy"
                decoding="async"
              />
              <figcaption className={styles.planCaption}>
                <p className={styles.planTitle}>{plan.title}</p>
                <p className={styles.planText}>{plan.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="venue-closing">
        <p className={styles.label}>{v.closing.label}</p>
        <h2 id="venue-closing" className={styles.heading}>
          {v.closing.title}
        </h2>
        <p className={styles.body}>{v.closing.body}</p>
        <Link to="/thespark" className={actionLinkStyles.action}>
          <span className={actionLinkStyles.label}>{v.closing.cta}</span>
          <svg className={actionLinkStyles.arrow} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M4 4 L12 12 M5.5 12 H12 V5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </Link>
      </section>

      <footer className={styles.footer}>
        <Link to="/" className={styles.mark} aria-label={`${brand.name}, home`}>
          <Logotype />
        </Link>
        <p className={styles.line}>{brand.line}</p>
      </footer>
    </main>
  )
}
