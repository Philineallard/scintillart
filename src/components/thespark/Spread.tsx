import { useEffect, useRef, useState } from 'react'
import type { Figure } from '../../content/thespark'
import styles from './Spread.module.css'

const base = import.meta.env.BASE_URL

/**
 * Silent video that plays while the cursor is on it (or while it has keyboard focus) and
 * pauses when the cursor leaves. On touch screens a tap starts and stops it. It never
 * starts on its own, so it is reduced-motion safe. It starts loading once it is near the
 * screen, so it can begin straight away. Rendered without browser APIs (pre-rendering).
 */
function HoverVideo({ figure }: { figure: Figure }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = 'auto'
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const play = () => {
    ref.current?.play().then(() => setPlaying(true)).catch(() => {})
  }
  const pause = () => {
    ref.current?.pause()
    setPlaying(false)
  }

  return (
    <video
      ref={ref}
      className={styles.media}
      src={`${base}thespark/${figure.name}.mp4`}
      poster={`${base}thespark/${figure.name}-poster.webp`}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={0}
      aria-label={figure.alt}
      width={600}
      height={750}
      onPointerEnter={(e) => e.pointerType === 'mouse' && play()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && pause()}
      onClick={() => (playing ? pause() : play())}
      onFocus={play}
      onBlur={pause}
    />
  )
}

/** Three frames of the same size side by side: photos and silent hover videos, no lines, no captions. */
export function Spread({ figures }: { figures: readonly Figure[] }) {
  return (
    <div className={styles.spread}>
      {figures.map((f) => (
        <figure key={f.name} className={styles.figure}>
          {f.kind === 'video' ? (
            <HoverVideo figure={f} />
          ) : (
            <img
              className={styles.media}
              src={`${base}thespark/${f.name}.webp`}
              srcSet={`${base}thespark/${f.name}-sm.webp 540w, ${base}thespark/${f.name}.webp 900w`}
              sizes="(max-width: 720px) 92vw, 31vw"
              alt={f.alt}
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
            />
          )}
        </figure>
      ))}
    </div>
  )
}
