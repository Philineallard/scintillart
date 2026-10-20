import styles from './Logotype.module.css'

/**
 * "Scintillart" in the display italic. On hover the word opens up: "Scinti" slides
 * left, "art" slides right, and the double "ll" in the centre turns into the bold
 * sans, standing upright like two pillars. At rest it is one italic word.
 * Reads as one word for assistive technology (no spaces between the spans).
 * Size comes from the parent's font-size.
 */
export function Logotype() {
  return (
    <span className={styles.logotype}>
      <span className={styles.left}>Scinti</span>
      <span className={styles.ll}>
        <span className={styles.llItalic}>ll</span>
        <span className={styles.llBold} aria-hidden="true">
          ll
        </span>
      </span>
      <span className={styles.right}>art</span>
    </span>
  )
}
