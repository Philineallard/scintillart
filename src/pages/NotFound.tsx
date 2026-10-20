import { Link } from 'react-router'
import { brand } from '../content/brand'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './RetreatPage.module.css'

export default function NotFound() {
  useDocumentTitle(`Page not found · ${brand.name}`)
  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <Link to="/" className={styles.home}>
          {brand.name}
        </Link>
      </header>
      <section>
        <h1 className={styles.title} tabIndex={-1} data-route-heading="">
          This page doesn’t exist.
        </h1>
        <p className={styles.line}>
          <Link to="/">Return to {brand.name}</Link>
        </p>
      </section>
    </main>
  )
}
