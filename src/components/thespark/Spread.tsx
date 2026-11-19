import { useEffect, useRef, useState } from 'react'
import type { Figure } from '../../content/thespark'
import styles from './Spread.module.css'

const base = import.meta.env.BASE_URL

/**
 * Silent looping video. It only plays while on screen, and never on its own under
 * prefers-reduced-motion (then it shows its poster with controls, to play by choice).
 * Rendered without browser APIs so /thespark can be pre-rendered.
 */
function LoopVideo({ figure }: { figure: Figure }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(media.matches)
    if (media.matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

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
      controls={reduced}
      aria-label={figure.alt}
      width={figure.width}
      height={figure.height}
    />
  )
}

/** Three figures side by side, set like a newspaper page: double rule and column rules. Photos are shown whole. */
export function Spread({ figures }: { figures: readonly Figure[] }) {
  return (
    <div className={styles.spread}>
      {figures.map((f) => (
        <figure key={f.name} className={styles.figure}>
          <div className={f.kind === 'video' ? `${styles.frame} ${styles.videoFrame}` : styles.frame}>
            {f.kind === 'video' ? (
              <LoopVideo figure={f} />
            ) : (
              <img
                className={styles.media}
                src={`${base}thespark/${f.name}.webp`}
                srcSet={`${base}thespark/${f.name}-sm.webp 640w, ${base}thespark/${f.name}.webp 1200w`}
                sizes="(max-width: 720px) 92vw, 38vw"
                alt={f.alt}
                width={f.width}
                height={f.height}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        </figure>
      ))}
    </div>
  )
}
