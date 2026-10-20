import styles from './Logotype.module.css'

/**
 * "Scintillart" set in two voices: the word in the display italic, with the double
 * "ll" in the bold sans, standing upright like two pillars in the middle of the word.
 * Reads as one word for assistive technology (no spaces between the spans).
 * Size comes from the parent's font-size.
 */
export function Logotype() {
  return (
    <span className={styles.logotype}>
      <span className={styles.italic}>Scinti</span>
      <span className={styles.ll}>ll</span>
      <span className={styles.italic}>art</span>
    </span>
  )
}
