import { useId } from 'react'
import { Link } from 'react-router'
import { ActionLink } from '../components/ActionLink'
import { Logotype } from '../components/Logotype'
import { PracticeList } from '../components/PracticeList'
import { Takeaways } from '../components/Takeaways'
import { brand } from '../content/brand'
import { interestHref, retreat } from '../content/retreat'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './RetreatPage.module.css'

type Props = {
  /** Rendered inside the portal transition layer (hidden, inert) rather than as the route. */
  embedded?: boolean
}

/**
 * The retreat, on one screen: title, practices and the rotating "What people take home"
 * on the left, the practical facts and the call to action on the right. On small screens it stacks; it scrolls only if the screen is too short.
 */
export default function RetreatPage({ embedded = false }: Props) {
  useDocumentTitle(`${retreat.eyebrow} · ${brand.name}`, !embedded)
  const practicesId = useId()
  const Root = embedded ? 'div' : 'main'
  const tab = embedded ? -1 : undefined

  return (
    <Root className={styles.page}>
      <header className={styles.top}>
        <Link to="/" className={styles.home} tabIndex={tab} aria-label={`${brand.name}, home`}>
          <Logotype />
        </Link>
        <p className={styles.eyebrow}>{retreat.eyebrow}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.lead}>
          <section className={styles.hero}>
            <h1 className={styles.title} tabIndex={-1} {...(embedded ? {} : { 'data-route-heading': '' })}>
              {retreat.title}
            </h1>
            <p className={styles.line}>{retreat.line}</p>
          </section>

          <section className={styles.practices} aria-labelledby={practicesId}>
            <h2 id={practicesId} className={styles.label}>
              Practices
            </h2>
            <PracticeList practices={retreat.practices} embedded={embedded} />
          </section>

          <Takeaways
            title={retreat.takeaways.title}
            caption={retreat.takeaways.caption}
            items={retreat.takeaways.items}
            autoplay={!embedded}
            embedded={embedded}
          />
        </div>

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


          <div className={styles.interest}>
            <ActionLink href={interestHref()} tabIndex={tab}>
              {retreat.interest.label}
            </ActionLink>
            <p className={styles.note}>{retreat.interest.note}</p>
          </div>
        </div>
      </div>
    </Root>
  )
}
