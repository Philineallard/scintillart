import { useEffect, useRef } from 'react'
import type { Chapter } from '../../content/thespark'
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
    </nav>
  )
}
