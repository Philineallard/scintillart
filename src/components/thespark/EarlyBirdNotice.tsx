import { useEffect, useState } from 'react'
import { thespark } from '../../content/thespark'
import { RegisterButton } from './register'
import styles from './EarlyBirdNotice.module.css'

const KEY = 'scintillart-earlybird-closed'
const DELAY_MS = 4000

/**
 * A quiet corner notice: "Early bird prices until 6 December", with Register your interest.
 * Never shown during pre-render, after the deadline, once closed, or while the panel is open.
 */
export function EarlyBirdNotice({ hidden }: { hidden: boolean }) {
  const n = thespark.earlyBirdNotice
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (Date.now() >= Date.parse(n.until)) return
    try {
      if (localStorage.getItem(KEY)) return
    } catch {
      /* storage unavailable: just show it */
    }
    const t = window.setTimeout(() => setShow(true), DELAY_MS)
    return () => window.clearTimeout(t)
  }, [n.until])

  const close = () => {
    setShow(false)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (!show || hidden) return null
  return (
    <aside className={styles.notice} aria-label={n.label}>
      <button type="button" className={styles.close} onClick={close} aria-label={n.close}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      </button>
      <p className={styles.kicker}>{n.kicker}</p>
      <p className={styles.text}>{n.text}</p>
      <RegisterButton className={styles.button}>{thespark.interest.label}</RegisterButton>
    </aside>
  )
}
