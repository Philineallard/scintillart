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
      width={600}
      height={750}
    />
  )
}

/** Three figures side by side, set like a newspaper page: double rule, column rules, numbered captions. */
export function Spread({ figures }: { figures: readonly Figure[] }) {
  return (
    <div className={styles.spread}>
      {figures.map((f, i) => (
        <figure key={f.name} className={styles.figure}>
          <div className={styles.frame}>
            {f.kind === 'video' ? (
              <LoopVideo figure={f} />
            ) : (
              <img
                className={styles.media}
                src={`${base}thespark/${f.name}.webp`}
                srcSet={`${base}thespark/${f.name}-sm.webp 540w, ${base}thespark/${f.name}.webp 900w`}
                sizes="(max-width: 720px) 92vw, 30vw"
                alt={f.alt}
                width={900}
                height={1125}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
            {f.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
