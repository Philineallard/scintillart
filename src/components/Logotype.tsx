import styles from './Logotype.module.css'

/**
 * "Scintillart" set in two voices: "Scintill" in the display italic, "art" in the
 * bold sans. Reads as one word for assistive technology (no spaces between the spans).
 * Size comes from the parent's font-size.
 */
export function Logotype() {
  return (
    <span className={styles.logotype}>
      <span className={styles.scintill}>Scintill</span>
      <span className={styles.art}>art</span>
    </span>
  )
}
