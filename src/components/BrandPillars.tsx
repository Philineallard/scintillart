import type { Ref } from 'react'
import { brand } from '../content/brand'
import styles from './BrandPillars.module.css'

type Props = {
  ref?: Ref<HTMLElement>
  className?: string
  /** Index of the pillar shown; follows the definition sense on the left. All three stay in the document. */
  active?: number
  reducedMotion?: boolean
}

/**
 * Art, Culture, Events: set in the same style as the definition, one at a time,
 * changing together with the definition. Copy lives in content/brand.ts.
 */
export function BrandPillars({ ref, className, active = 0, reducedMotion }: Props) {
  return (
    <section
      ref={ref}
      className={[styles.pillars, className].filter(Boolean).join(' ')}
      aria-label="What we do"
      data-reduced-motion={reducedMotion ? '' : undefined}
    >
      <ul className={styles.list}>
        {brand.pillars.map((pillar, i) => (
          <li key={pillar.name} className={styles.pillar} data-active={i === active ? '' : undefined}>
            <p className={styles.name}>{pillar.name}</p>
            <p className={styles.lead}>{pillar.lead}</p>
            <p className={styles.body}>{pillar.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
