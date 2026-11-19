import { Link } from 'react-router'
import { BrandGrain } from '../components/thespark/BrandGrain'
import { Value } from '../components/thespark/Tba'
import { ThemeToggle } from '../components/thespark/ThemeToggle'
import { Logotype } from '../components/Logotype'
import { brand } from '../content/brand'
import { privacy } from '../content/privacy'
import { terms } from '../content/terms'
import { thespark } from '../content/thespark'
import { useBrandTheme } from '../hooks/useBrandTheme'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import pageStyles from './TheSparkPage.module.css'
import styles from './PrivacyPage.module.css'

type Doc = typeof privacy | typeof terms

/**
 * A text page on Brand Guidelines v2.0 like /thespark (same header pattern, light/dark):
 * /privacy (src/content/privacy.ts) and /booking-terms (src/content/terms.ts).
 */
export default function PrivacyPage({ doc = privacy }: { doc?: Doc }) {
  useDocumentTitle(doc.meta.title)
  const { theme, setTheme } = useBrandTheme()
  const { ui } = thespark

  return (
    <div className={pageStyles.page} data-brand-root="">
      <BrandGrain />
      <header className={`${pageStyles.header} ${styles.header}`}>
        <Link to="/" className={pageStyles.home} aria-label={ui.home}>
          <Logotype />
        </Link>
        <div className={pageStyles.tools}>
          <Link to={thespark.path} className={styles.back}>
            {thespark.hero.title}
          </Link>
          <ThemeToggle theme={theme} onChange={setTheme} label={ui.themeLabel} lightLabel={ui.light} darkLabel={ui.dark} />
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.h1} tabIndex={-1} data-route-heading="">
          {doc.title}
        </h1>
        <p className={styles.updated}>{doc.updated}</p>
        <p className={styles.intro}>{doc.intro}</p>

        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className={styles.h2}>
              {s.heading}
            </h2>
            {s.paragraphs?.map((p) => (
              <p key={p} className={styles.p}>
                {p}
              </p>
            ))}
            {s.items && (
              <dl className={styles.items}>
                {s.items.map((item) => (
                  <div key={item.term} className={styles.item}>
                    <dt className={styles.term}>{item.term}</dt>
                    <dd className={styles.text}>
                      <Value value={item.text} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ))}
      </main>

      <footer className={pageStyles.footer}>
        <Link to="/" className={pageStyles.footerMark} aria-label={ui.home}>
          <Logotype />
        </Link>
        <p className={pageStyles.slogan}>{brand.line}</p>
      </footer>
    </div>
  )
}
