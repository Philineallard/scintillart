import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import type { Practice } from '../content/retreat'
import styles from './PracticeList.module.css'

type Props = {
  practices: readonly Practice[]
  /** Inside the inert transition layer: plain text, no interaction. */
  embedded?: boolean
}

const base = `${import.meta.env.BASE_URL}workshops/`

/**
 * Practices as a typographic list. Hovering (mouse), tapping (touch) or focusing
 * (keyboard) a practice reveals a photo from a past workshop. The photo follows
 * the cursor with a little lag and tilt, and arrives through a liquid distortion
 * (an SVG displacement filter) that settles to a sharp image.
 */
export function PracticeList({ practices, embedded = false }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0, r: 0 })
  const frame = useRef(0)
  const reduced = useRef(false)

  // Preload the photos once the page is idle, so the first hover is instant.
  useEffect(() => {
    if (embedded) return
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => {
      practices.forEach((p) => {
        if (p.image) new Image().src = `${base}${p.image.slug}.webp`
      })
    }, 1200)
    return () => window.clearTimeout(t)
  }, [practices, embedded])

  // Follow loop: only runs while a photo is visible.
  const loop = () => {
    const layer = layerRef.current
    if (!layer) return
    const c = current.current
    const t = target.current
    const dx = t.x - c.x
    c.x += dx * 0.16
    c.y += (t.y - c.y) * 0.16
    c.r += (Math.max(-8, Math.min(8, dx * 0.08)) - c.r) * 0.12
    const w = layer.offsetWidth
    const h = layer.offsetHeight
    const x = Math.max(8, Math.min(window.innerWidth - w - 8, c.x - w / 2))
    const y = Math.max(8, Math.min(window.innerHeight - h - 8, c.y - h - 28))
    layer.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${reduced.current ? 0 : c.r}deg)`
    frame.current = requestAnimationFrame(loop)
  }

  const show = (index: number, x: number, y: number, jump: boolean) => {
    const p = practices[index]
    if (!p.image || embedded) return
    target.current = { x, y }
    if (jump || active === null) current.current = { x, y, r: 0 }
    setActive(index)
    const img = imgRef.current
    const disp = dispRef.current
    const layer = layerRef.current
    if (img && layer) {
      img.src = `${base}${p.image.slug}.webp`
      img.alt = p.image.alt
      img.width = p.image.w
      img.height = p.image.h
      gsap.killTweensOf([layer, disp])
      if (reduced.current) {
        gsap.set(layer, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)' })
      } else {
        gsap.fromTo(layer, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out' })
        gsap.fromTo(layer, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.out' })
        if (disp) gsap.fromTo(disp, { attr: { scale: 90 } }, { attr: { scale: 0 }, duration: 1.1, ease: 'power3.out' })
      }
    }
    if (!frame.current) frame.current = requestAnimationFrame(loop)
  }

  const hide = () => {
    setActive(null)
    const layer = layerRef.current
    if (!layer) return
    gsap.killTweensOf(layer)
    gsap.to(layer, {
      autoAlpha: 0,
      scale: 0.96,
      duration: reduced.current ? 0 : 0.3,
      ease: 'power2.in',
      onComplete: () => {
        cancelAnimationFrame(frame.current)
        frame.current = 0
      },
    })
  }

  // Tap anywhere else closes a photo opened by touch.
  useEffect(() => {
    if (active === null) return
    const onDown = (e: PointerEvent) => {
      if (!listRef.current?.contains(e.target as Node)) hide()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const anchor = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top }
  }

  return (
    <>
      <ul ref={listRef} className={styles.list}>
        {practices.map((p, i) => (
          <li key={p.name} className={styles.item}>
            {p.image && !embedded ? (
              <button
                type="button"
                className={styles.practice}
                aria-pressed={active === i}
                aria-label={`${p.name}: show a photo from a past workshop`}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') show(i, e.clientX, e.clientY, active === null)
                }}
                onPointerMove={(e) => {
                  if (e.pointerType === 'mouse') target.current = { x: e.clientX, y: e.clientY }
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === 'mouse') hide()
                }}
                onClick={(e) => {
                  // Touch and keyboard: toggle, anchored above the word.
                  if ((e.nativeEvent as PointerEvent).pointerType === 'mouse') return
                  if (active === i) return hide()
                  const a = anchor(e.currentTarget)
                  show(i, a.x, a.y, true)
                }}
                onFocus={(e) => {
                  if (!e.currentTarget.matches(':focus-visible')) return
                  const a = anchor(e.currentTarget)
                  show(i, a.x, a.y, true)
                }}
                onBlur={hide}
              >
                {p.name}
              </button>
            ) : (
              <span className={p.image ? `${styles.practice} ${styles.plain}` : styles.plain}>{p.name}</span>
            )}
          </li>
        ))}
      </ul>

      {!embedded && (
        <>
          <svg className={styles.defs} aria-hidden="true" focusable="false">
            <filter id="practice-distort" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="3" result="noise" />
              <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <div ref={layerRef} className={styles.reveal} aria-hidden="true">
            <img ref={imgRef} alt="" decoding="async" />
          </div>
        </>
      )}
    </>
  )
}
