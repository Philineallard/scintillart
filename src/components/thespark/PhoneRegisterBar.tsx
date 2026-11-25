import { useEffect, useState } from 'react'
import { thespark } from '../../content/thespark'
import { RegisterButton } from './register'
import pageStyles from '../../pages/TheSparkPage.module.css'
import styles from './PhoneRegisterBar.module.css'

/**
 * Phones only (the header button is hidden there): a slim bar at the bottom of the screen with
 * the starting price and "Register your interest" (Igor, 25 November 2026). It appears once the
 * hero has scrolled away and steps aside while the closing section, which has its own button,
 * is on screen. Not rendered on the server: it depends on the scroll position.
 */
export function PhoneRegisterBar() {
  const [heroGone, setHeroGone] = useState(false)
  const [closingShown, setClosingShown] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('[aria-labelledby="thespark-title"]')
    const closing = document.getElementById('interest')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) setHeroGone(!e.isIntersecting && e.boundingClientRect.top < 0)
        if (e.target === closing) setClosingShown(e.isIntersecting)
      }
    })
    if (hero) io.observe(hero)
    if (closing) io.observe(closing)
    return () => io.disconnect()
  }, [])

  const shown = heroGone && !closingShown
  return (
    <div className={styles.bar} data-shown={shown ? '' : undefined} aria-hidden={shown ? undefined : true}>
      <p className={styles.price}>
        <span className={styles.amount}>{thespark.interest.fromPrice.amount}</span>{' '}
        <span className={styles.basis}>{thespark.interest.fromPrice.basis}</span>
      </p>
      <RegisterButton className={`${pageStyles.button} ${styles.button}`} tabIndex={shown ? undefined : -1}>
        {thespark.interest.label}
      </RegisterButton>
    </div>
  )
}
