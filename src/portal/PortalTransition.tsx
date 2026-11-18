import type { Ref } from 'react'
import TheSparkPage from '../pages/TheSparkPage'
import styles from './PortalTransition.module.css'

/**
 * The destination layer for the portal transition: The Spark page, pre-rendered,
 * hidden and inert. During the transition it's revealed through the projected
 * doorway arch (clip-path written by the scene or the static fallback). When the
 * transition completes the route changes to /thespark, which renders the same page
 * in normal flow. data-brand-embedded gives it the v2.0 tokens (light theme).
 */
export function PortalTransition({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={styles.destination} inert aria-hidden="true" data-brand-embedded="">
      <TheSparkPage embedded />
    </div>
  )
}
