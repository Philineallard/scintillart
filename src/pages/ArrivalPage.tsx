import { useId, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ActionLink } from '../components/ActionLink'
import { Logotype } from '../components/Logotype'
import { brand } from '../content/brand'
import { arrival, type ArrivalImage, type ArrivalItem } from '../content/arrival'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './ArrivalPage.module.css'

const base = import.meta.env.BASE_URL

/** One photograph, cropped by its container (object-fit: cover) and kept on its subject. */
function Photo({ image, eager = false, className }: { image: ArrivalImage; eager?: boolean; className?: string }) {
  return (
    <img
      className={[styles.photo, className].filter(Boolean).join(' ')}
      src={`${base}arrival/${image.slug}.webp`}
      width={image.w}
      height={image.h}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={image.focus ? { objectPosition: image.focus } : undefined}
    />
  )
}

function Items({ items }: { items: ArrivalItem[] }) {
  return (
    <ul className={styles.items}>
      {items.map((item) => (
        <li key={item.title} className={styles.item}>
          <span className={styles.itemTitle}>{item.title}</span>
          {item.detail ? <span className={styles.itemDetail}>{item.detail}</span> : null}
        </li>
      ))}
    </ul>
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
  image: ArrivalImage
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

function Pair({ images, credit }: { images: ArrivalImage[]; credit?: string }) {
  return (
    <figure className={styles.pair}>
      {images.map((image) => (
        <Photo key={image.slug} image={image} />
      ))}
      {credit ? <figcaption className={styles.credit}>{credit}</figcaption> : null}
    </figure>
  )
}

function Wide({ image }: { image: ArrivalImage }) {
  return (
    <figure className={styles.wide}>
      <Photo image={image} />
    </figure>
  )
}

/**
 * /arrival-in-lisbon: the "Arrival in Lisbon" collaboration proposal for boutique hotels,
 * the web version of the printed booklet. One long editorial scroll: hero, chapters
 * alternating text and photograph, photo spreads in between, and a signed close.
 */
export default function ArrivalPage() {
  const a = arrival
  useDocumentTitle(`${a.title} · ${brand.name}`)

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <Link to="/" className={styles.home} aria-label={`${brand.name}, home`}>
          <Logotype />
        </Link>
        <p className={styles.eyebrow}>{a.eyebrow}</p>
      </header>

      <section className={styles.hero}>
        <figure className={styles.heroImage}>
          <Photo image={a.heroImage} eager />
        </figure>
        <div className={styles.heroText}>
          <p className={styles.label}>{a.eyebrow}</p>
          <h1 className={styles.title} tabIndex={-1} data-route-heading="">
            {a.title}
          </h1>
          <p className={styles.line}>{a.line}</p>
          <p className={styles.intro}>{a.intro}</p>
          <p className={styles.label}>{a.disciplines}</p>
        </div>
      </section>

      <Chapter label={`01 ${a.about.label}`} title={a.about.title} image={a.about.image}>
        {a.about.body.map((p) => (
          <p key={p} className={styles.body}>
            {p}
          </p>
        ))}
      </Chapter>

      <Chapter label={`02 ${a.idea.label}`} title={a.idea.title} image={a.idea.image} flip>
        <p className={styles.body}>{a.idea.body}</p>
        <Items items={a.idea.moments} />
      </Chapter>

      <Pair images={a.interiors} />

      <Chapter label={`03 ${a.create.label}`} title={a.create.title} image={a.create.image}>
        <Items items={a.create.items} />
        <p className={styles.note}>{a.create.note}</p>
      </Chapter>

      <Pair images={a.daylight.images} credit={a.daylight.credit} />

      <Wide image={a.cafe} />

      <Chapter label={`04 ${a.part.label}`} title={a.part.title} image={a.part.image} flip>
        <Items items={a.part.items} />
      </Chapter>

      <Pair images={a.night.images} credit={a.night.credit} />

      <Chapter label={`05 ${a.review.label}`} title={a.review.title} image={a.review.image}>
        <p className={styles.body}>{a.review.body}</p>
        <Items items={a.review.items} />
        <ActionLink href={a.review.link.href} target="_blank" rel="noopener">
          {a.review.link.label}
        </ActionLink>
      </Chapter>

      <Wide image={a.bottles} />

      <section className={styles.closing} aria-labelledby="arrival-closing">
        <div className={styles.closingText}>
          <p className={styles.label}>06 {a.closing.label}</p>
          <h2 id="arrival-closing" className={styles.heading}>
            {a.closing.title}
          </h2>
          {a.closing.body.map((p) => (
            <p key={p} className={styles.body}>
              {p}
            </p>
          ))}
        </div>
        <div className={styles.sign}>
          <img
            className={styles.signature}
            src={`${base}${a.closing.signature.src}`}
            width={a.closing.signature.w}
            height={a.closing.signature.h}
            alt={a.closing.signature.alt}
            loading="lazy"
          />
          <p className={styles.label}>{a.closing.names}</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link to="/" className={styles.mark} aria-label={`${brand.name}, home`}>
          <Logotype />
        </Link>
        <p className={styles.line}>{brand.line}</p>
        <ActionLink href={`mailto:${brand.contact.email}`}>{brand.contact.email}</ActionLink>
      </footer>
    </main>
  )
}
