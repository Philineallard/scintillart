import { useEffect, useRef } from 'react'
import type { Chapter } from '../../content/thespark'
import { useScrollEdges } from '../../hooks/useScrollEdges'
import styles from './ChapterNav.module.css'

type Props = {
  chapters: readonly Chapter[]
  active: string | null
  label: string
  tabIndex?: number
}

/**
 * The eight chapters as real #anchor links (smooth scrolling comes from Lenis, which
 * also honours each section's scroll-margin-top). On narrow screens the list scrolls
 * sideways and keeps the current chapter in view.
 */
export function ChapterNav({ chapters, active, label, tabIndex }: Props) {
  const listRef = useRef<HTMLOListElement>(null)
  // A small arrow at the edge that has more chapters (Igor, 25 November 2026): shows the row scrolls.
  const edges = useScrollEdges(listRef)
  const nudge = (dir: 1 | -1) => {
    const list = listRef.current
    if (list) list.scrollBy({ left: dir * list.clientWidth * 0.7, behavior: 'smooth' })
  }

  useEffect(() => {
    const list = listRef.current
    if (!list || !active || list.scrollWidth <= list.clientWidth) return
    const link = list.querySelector<HTMLElement>(`[data-chapter="${active}"]`)
    if (!link) return
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2
    list.scrollTo({ left, behavior: 'smooth' })
  }, [active])

  return (
    <nav className={styles.nav} aria-label={label}>
      <ol ref={listRef} className={styles.list}>
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#${c.id}`}
              className={styles.link}
              data-chapter={c.id}
              aria-current={active === c.id ? 'location' : undefined}
              tabIndex={tabIndex}
            >
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {c.nav}
            </a>
          </li>
        ))}
      </ol>
      {/* Pointer and touch only: keyboard users reach every chapter with Tab. */}
      <button type="button" className={`${styles.more} ${styles.moreStart}`} data-shown={edges.start ? '' : undefined} onClick={() => nudge(-1)} tabIndex={-1} aria-hidden="true">
        <svg viewBox="0 0 16 12" width="16" height="12" aria-hidden="true">
          <path d="M16 6H2M7 1L2 6l5 5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <button type="button" className={`${styles.more} ${styles.moreEnd}`} data-shown={edges.end ? '' : undefined} onClick={() => nudge(1)} tabIndex={-1} aria-hidden="true">
        <svg viewBox="0 0 16 12" width="16" height="12" aria-hidden="true">
          <path d="M0 6h14M9 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </nav>
  )
}
