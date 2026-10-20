import type { Ref } from 'react'
import { brand } from '../content/brand'
import styles from './ScintillartWordmark.module.css'

type Props = {
  ref?: Ref<HTMLSpanElement>
  /** Render as the page's h1 (entry page) or as a plain element. */
  as?: 'h1' | 'p'
  className?: string
}

/**
 * The oversized Scintillart wordmark. Its size is set by the parent through the
 * --wm-size custom property, so layouts can fit it to the viewport precisely.
 * The animated inner span is separate from the heading so motion never affects layout.
 */
export function ScintillartWordmark({ ref, as: Tag = 'h1', className }: Props) {
  return (
    <Tag className={[styles.wordmark, className].filter(Boolean).join(' ')} tabIndex={-1} data-route-heading="">
      <span ref={ref} className={styles.inner}>
        {brand.name}
      </span>
    </Tag>
  )
}
