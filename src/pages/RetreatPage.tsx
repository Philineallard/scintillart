import { useId } from 'react'
import { Link } from 'react-router'
import { ActionLink } from '../components/ActionLink'
import { brand } from '../content/brand'
import { interestHref, retreat } from '../content/retreat'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './RetreatPage.module.css'

type Props = {
  /** Rendered inside the portal transition layer (hidden, inert) rather than as the route. */
  embedded?: boolean
}

export default function RetreatPage({ embedded = false }: Props) {
  useDocumentTitle(`${retreat.eyebrow} · ${brand.name}`, !embedded)
  const practicesId = useId()
  const Root = embedded ? 'div' : 'main'

  return (
    <Root className={styles.page}>
      <header className={styles.top}>
        <Link to="/" className={styles.home} tabIndex={embedded ? -1 : undefined}>
          {brand.name}
        </Link>
        <p className={styles.eyebrow}>{retreat.eyebrow}</p>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.title} tabIndex={-1} {...(embedded ? {} : { 'data-route-heading': '' })}>
          {retreat.title}
        </h1>
        <p className={styles.line}>{retreat.line}</p>
      </section>

      <div className={styles.body}>
        <figure className={styles.figure}>
          <img
            src="/portal/doorway.webp"
            width={201}
            height={423}
            alt="Detail of the collage: a vaulted cathedral corridor leading to a mirrored doorway."
            decoding="async"
          />
          <figcaption className={styles.caption}>Detail from the Scintillart collage</figcaption>
        </figure>

        <div className={styles.details}>
          <dl className={styles.facts}>
            {retreat.facts.map((fact) => (
              <div key={fact.term} className={styles.fact}>
                <dt>{fact.term}</dt>
                <dd>
                  {fact.detail}
                  {'note' in fact && fact.note ? <span className={styles.note}>{fact.note}</span> : null}
                </dd>
              </div>
            ))}
          </dl>

          <section className={styles.practices} aria-labelledby={practicesId}>
            <h2 id={practicesId} className={styles.label}>
              Practices
            </h2>
            <ul>
              {retreat.practices.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>

          <div className={styles.interest}>
            <ActionLink href={interestHref()} tabIndex={embedded ? -1 : undefined}>
              {retreat.interest.label}
            </ActionLink>
            <p className={styles.note}>{retreat.interest.note}</p>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>{brand.name}</span>
        <span>{brand.domain}</span>
      </footer>
    </Root>
  )
}
