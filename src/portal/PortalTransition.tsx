import type { Ref } from 'react'
import RetreatPage from '../pages/RetreatPage'
import styles from './PortalTransition.module.css'

/**
 * The destination layer for the portal transition: the real retreat page,
 * pre-rendered, hidden and inert. During the transition it's revealed through the
 * projected doorway arch (clip-path written by the scene or the static fallback).
 * When the transition completes the route changes to /retreats, which renders the
 * identical page in normal flow, so there is no visual jump.
 */
export function PortalTransition({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={styles.destination} inert aria-hidden="true">
      <RetreatPage embedded />
    </div>
  )
}
