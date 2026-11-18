import styles from './BrandGrain.module.css'

/**
 * The approved film grain and soft vignette (brand pack texture/README.md), behind all
 * content on background surfaces only: never over photographs, text, logos or controls.
 */
export function BrandGrain() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  )
}
