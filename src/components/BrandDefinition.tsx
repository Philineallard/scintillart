import type { Ref } from 'react'
import { brand } from '../content/brand'
import styles from './BrandDefinition.module.css'

type Props = { ref?: Ref<HTMLElement>; className?: string }

/** The approved dictionary entry, set editorially. Copy lives in content/brand.ts. */
export function BrandDefinition({ ref, className }: Props) {
  return (
    <section ref={ref} className={[styles.definition, className].filter(Boolean).join(' ')} aria-label="Definition">
      <p className={styles.headword}>
        <dfn className={styles.term}>{brand.name}</dfn>
        <span className={styles.dash} aria-hidden="true">
          —
        </span>
        <span className={styles.pron}>{brand.pronunciation}</span>
      </p>
      <p className={styles.pos}>{brand.partOfSpeech}</p>
      <ol className={styles.senses}>
        {brand.senses.map((sense) => (
          <li key={sense.lead} className={styles.sense}>
            <p className={styles.lead}>{sense.lead}</p>
            <p className={styles.body}>{sense.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
