import { Link } from 'react-router'
import { BrandGrain } from '../components/thespark/BrandGrain'
import { Value } from '../components/thespark/Tba'
import { ThemeToggle } from '../components/thespark/ThemeToggle'
import { Logotype } from '../components/Logotype'
import { brand } from '../content/brand'
import { privacy } from '../content/privacy'
import { thespark } from '../content/thespark'
import { useBrandTheme } from '../hooks/useBrandTheme'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import pageStyles from './TheSparkPage.module.css'
import styles from './PrivacyPage.module.css'

/**
 * /privacy: the privacy policy, on Brand Guidelines v2.0 like /thespark (same header
 * pattern, light/dark). All text in src/content/privacy.ts.
 */
export default function PrivacyPage() {
  useDocumentTitle(privacy.meta.title)
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
          {privacy.title}
        </h1>
        <p className={styles.updated}>{privacy.updated}</p>
        <p className={styles.intro}>{privacy.intro}</p>

        {privacy.sections.map((s) => (
          <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className={styles.h2}>
              {s.heading}
            </h2>
            {'items' in s && s.items && (
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
            {s.paragraphs?.map((p) => (
              <p key={p} className={styles.p}>
                {p}
              </p>
            ))}
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
