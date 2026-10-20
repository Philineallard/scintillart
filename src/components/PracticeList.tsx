import type { Practice } from '../content/retreat'
import styles from './PracticeList.module.css'

type Props = { practices: readonly Practice[] }

/** Practices as a typographic list, separated by clay slashes. */
export function PracticeList({ practices }: Props) {
  return (
    <ul className={styles.list}>
      {practices.map((p) => (
        <li key={p.name} className={styles.item}>
          {p.name}
        </li>
      ))}
    </ul>
  )
}
