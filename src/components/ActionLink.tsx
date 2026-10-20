import type { AnchorHTMLAttributes, Ref } from 'react'
import styles from './ActionLink.module.css'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { ref?: Ref<HTMLAnchorElement> }

/** Primary text action ("Our retreats", "Register your interest"): a real link, not a pill button. */
export function ActionLink({ ref, className, children, ...rest }: Props) {
  return (
    <a ref={ref} className={[styles.action, className].filter(Boolean).join(' ')} {...rest}>
      <span className={styles.label}>{children}</span>
      <svg className={styles.arrow} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M4 4 L12 12 M5.5 12 H12 V5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </a>
  )
}
