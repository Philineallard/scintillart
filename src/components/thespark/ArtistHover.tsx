import type { ReactNode } from 'react'
import type { Artist } from '../../content/artists'
import styles from './ArtistHover.module.css'

const base = import.meta.env.BASE_URL

/**
 * An artist's name that shows their portrait while the cursor is on it (or while the
 * name has keyboard focus).
 * The portrait is decorative here: the name itself carries the meaning.
 */
export function ArtistHover({ artist, children }: { artist?: Artist; children: ReactNode }) {
  if (!artist?.portrait) return <>{children}</>
  return (
    <span className={styles.wrap}>
      {children}
      <span className={styles.preview} aria-hidden="true">
        <img
          className={styles.img}
          src={`${base}artists/${artist.portrait.slug}-sm.webp`}
          alt=""
          width={360}
          height={480}
          loading="lazy"
          decoding="async"
        />
      </span>
    </span>
  )
}
