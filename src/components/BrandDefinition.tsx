import type { Ref } from 'react'
import { brand } from '../content/brand'
import styles from './BrandDefinition.module.css'

type Props = {
  ref?: Ref<HTMLElement>
  className?: string
  /** Index of the sense currently shown. All three stay in the document for assistive technology. */
  active?: number
  onSelect?: (index: number) => void
  reducedMotion?: boolean
}

/**
 * The approved dictionary entry, set editorially. Copy lives in content/brand.ts.
 * One sense is visible at a time; scrolling (or the 1 2 3 marks) moves between them.
 */
export function BrandDefinition({ ref, className, active = 0, onSelect, reducedMotion }: Props) {
  return (
    <section
      ref={ref}
      className={[styles.definition, className].filter(Boolean).join(' ')}
      aria-label="Definition"
      data-reduced-motion={reducedMotion ? '' : undefined}
    >
      <p className={styles.headword}>
        <dfn className={styles.term}>{brand.name}</dfn>
        <span className={styles.dash} aria-hidden="true">
          —
        </span>
        <span className={styles.pron}>{brand.pronunciation}</span>
      </p>
      <p className={styles.pos}>{brand.partOfSpeech}</p>

      <ol className={styles.senses}>
        {brand.senses.map((sense, i) => (
          <li key={sense.lead} className={styles.sense} data-active={i === active ? '' : undefined}>
            <p className={styles.lead}>{sense.lead}</p>
            <p className={styles.body}>{sense.body}</p>
          </li>
        ))}
      </ol>

      {onSelect && (
        <div className={styles.steps} role="group" aria-label="Show definition">
          {brand.senses.map((sense, i) => (
            <button
              key={sense.lead}
              type="button"
              className={styles.step}
              aria-pressed={i === active}
              aria-label={`Definition ${i + 1} of ${brand.senses.length}`}
              onClick={() => onSelect(i)}
            >
              <span aria-hidden="true">{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
