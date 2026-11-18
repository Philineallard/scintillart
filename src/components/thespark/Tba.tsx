import { TBA, type Maybe } from '../../content/thespark'
import styles from './Tba.module.css'

/** One consistent marker for unconfirmed details. */
export function Tba() {
  return <span className={styles.tba}>{TBA}</span>
}

/** A value from the content file, or the TBA marker when it isn't confirmed yet. */
export function Value({ value }: { value: Maybe<string> }) {
  return value === TBA ? <Tba /> : <>{value}</>
}
