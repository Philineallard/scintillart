import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import gsap from 'gsap'
import type Lenis from 'lenis'
import { registerMailto, thespark } from '../../content/thespark'
import { PHOTO, PHOTO_TO_3D } from '../../envelope/config'
import type { EnvelopeEngine } from '../../envelope/engine'
import { canUseWebGL, detectQuality, prefersReducedMotion } from '../../portal/capabilities'
import pageStyles from '../../pages/TheSparkPage.module.css'
import { RegisterContext } from './register'
import styles from './EnvelopeGate.module.css'

const base = import.meta.env.BASE_URL
// Layout effects only in the browser: the page is also pre-rendered at build.
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

type Props = {
  tabIndex?: number
  /** The page's smooth scroll, paused while the sequence plays. */
  lenis: RefObject<Lenis | null>
}

/**
 * The closing banner of /thespark: Igor's photograph of a wax-sealed envelope.
 * Clicking the envelope (or the button) plays a short sequence: the camera pushes into
 * the seal, a 3D envelope lifts out of the photo, the seal breaks, the letter comes out
 * and hands over to the "Register your interest" panel.
 *
 * - The WebGL engine (src/envelope, plain three.js) loads lazily when the banner is near.
 * - Reduced motion, no WebGL, or no JavaScript: the button opens the panel directly
 *   (or the mailto fallback), so nothing depends on the animation.
 * - Escape or a click skips straight to the panel. Nothing animates over the form.
 */
export function EnvelopeGate({ tabIndex, lenis }: Props) {
  const openRegister = useContext(RegisterContext)
  const { interest, envelope, register } = thespark
  const img = envelope.image

  const stage = useRef<HTMLDivElement>(null)
  const gate = useRef<HTMLDivElement>(null)
  const veil = useRef<HTMLDivElement>(null)
  const clone = useRef<HTMLDivElement>(null)
  const glHost = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLParagraphElement>(null)
  const engine = useRef<EnvelopeEngine | null>(null)
  const preparing = useRef<Promise<EnvelopeEngine | null> | null>(null)
  const anims = useRef<gsap.core.Animation[]>([])
  const opener = useRef<HTMLElement | null>(null)
  const map = useRef({ s: 1, ox: 0, oy: 0 })
  const busy = useRef(false)
  const [hot, setHot] = useState(false)
  const [run, setRun] = useState(0)

  /* Keep the clickable area on the real envelope, whatever the crop. */
  useClientLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    const layout = () => {
      const cw = el.clientWidth
      const ch = el.clientHeight
      const s = Math.max(cw / PHOTO.width, ch / PHOTO.height)
      const ox = (cw - PHOTO.width * s) * PHOTO.focusX
      const oy = (ch - PHOTO.height * s) * PHOTO.focusY
      map.current = { s, ox, oy }
      el.style.setProperty('--u', String(s))
      el.style.setProperty('--ex', `${ox + PHOTO.envelope.x * s}px`)
      el.style.setProperty('--ey', `${oy + PHOTO.envelope.y * s}px`)
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* Load and warm up the engine before anyone clicks. */
  const prepare = useCallback(() => {
    if (preparing.current) return preparing.current
    const host = glHost.current
    if (!host || prefersReducedMotion() || !canUseWebGL()) return (preparing.current = Promise.resolve(null))
    preparing.current = import('../../envelope/engine')
      .then((m) =>
        m.createEnvelopeEngine(host, {
          photoSrc: `${base}thespark/${img.name}-md.webp`,
          letter: { kicker: envelope.letterKicker, title: register.title, body: register.intro },
          quality: detectQuality(),
        }),
      )
      .then((e) => (engine.current = e))
      .catch((err) => {
        console.warn('Envelope scene unavailable', err)
        return null
      })
    return preparing.current
  }, [img.name, envelope.letterKicker, register.title, register.intro])

  useEffect(() => {
    const el = stage.current
    if (!el || !openRegister) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect()
          prepare()
        }
      },
      { rootMargin: '900px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [openRegister, prepare])

  useEffect(
    () => () => {
      anims.current.forEach((a) => a.kill())
      engine.current?.dispose()
      engine.current = null
    },
    [],
  )

  /* Hand over to the register panel, then fade the sequence out underneath it. */
  const finish = useCallback(() => {
    if (!busy.current) return
    busy.current = false // from here on Escape belongs to the panel
    anims.current.forEach((a) => a.kill())
    anims.current = []
    openRegister?.(undefined, opener.current)
    gsap.to(hint.current, { opacity: 0, duration: 0.2 })
    gsap.to(gate.current, {
      autoAlpha: 0,
      duration: 0.6,
      delay: 0.15,
      onComplete: () => {
        engine.current?.stop()
        engine.current?.reset()
        gsap.set([clone.current, veil.current, glHost.current, hint.current], { clearProps: 'all' })
      },
    })
  }, [openRegister])

  const start = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!openRegister || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (busy.current || gate.current?.style.visibility === 'visible') return
    opener.current = e.currentTarget
    setHot(false)
    if (prefersReducedMotion() || !canUseWebGL()) {
      openRegister(undefined, e.currentTarget)
      return
    }
    busy.current = true
    setRun((r) => r + 1)
  }

  /* The sequence. */
  useClientLayoutEffect(() => {
    if (!run) return
    let cancelled = false
    lenis.current?.stop()
    document.documentElement.style.overflow = 'hidden'

    // 1. push into the wax seal of the real photograph
    let r = stage.current!.getBoundingClientRect()
    if (r.top < 0 || r.bottom > window.innerHeight) {
      window.scrollTo({ top: window.scrollY + r.top - Math.max(0, (window.innerHeight - r.height) / 2), behavior: 'instant' })
      r = stage.current!.getBoundingClientRect()
    }
    const { s, ox, oy } = map.current
    const sx = ox + PHOTO.seal.x * s
    const sy = oy + PHOTO.seal.y * s
    const scale = Math.max(1.6, (0.3 * Math.min(window.innerWidth, window.innerHeight)) / (PHOTO.seal.size * s))
    const shown = stage.current!.querySelector('img')
    const cloneImg = clone.current!.querySelector('img')
    if (shown && cloneImg) cloneImg.src = shown.currentSrc || shown.src
    gsap.set(gate.current, { autoAlpha: 1 })
    gsap.set(glHost.current, { opacity: 0 })
    gsap.set(clone.current, { left: r.left, top: r.top, width: r.width, height: r.height, x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1, filter: 'blur(0px)', transformOrigin: `${sx}px ${sy}px` })
    const zoom = gsap
      .timeline()
      .fromTo(veil.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'none' }, 0)
      .to(clone.current, { x: window.innerWidth / 2 - (r.left + sx), y: window.innerHeight / 2 - (r.top + sy), scale, rotation: -5, duration: 2.1, ease: 'power3.inOut' }, 0)
      .to(clone.current, { filter: 'blur(12px)', duration: 0.9, ease: 'power1.in' }, 0.95)
    anims.current = [zoom, gsap.fromTo(hint.current, { opacity: 0 }, { opacity: 0.75, duration: 0.6, delay: 1 })]

    // 2. hand over to the 3D scene once it is warm; without it, straight to the panel
    const timeout = new Promise<null>((res) => setTimeout(() => res(null), 6000))
    Promise.race([prepare(), timeout]).then((eng) => {
      if (cancelled || !busy.current) return
      if (!eng) {
        zoom.eventCallback('onComplete', finish)
        return
      }
      anims.current.push(
        gsap.delayedCall(Math.max(0, PHOTO_TO_3D - zoom.time()), () => {
          if (cancelled || !busy.current) return
          eng.start()
          anims.current.push(
            gsap.to(glHost.current, { opacity: 1, duration: 0.8, ease: 'power1.inOut' }),
            gsap.to(clone.current, { autoAlpha: 0, duration: 0.8, delay: 0.2 }),
            eng.play(finish),
          )
        }),
      )
    })

    // Escape skips to the panel
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && busy.current) {
        e.preventDefault()
        finish()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelled = true
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  const hotProps = {
    onPointerEnter: () => {
      setHot(true)
      prepare()
    },
    onPointerLeave: () => setHot(false),
    onFocus: () => {
      setHot(true)
      prepare()
    },
    onBlur: () => setHot(false),
    onClick: start,
    'aria-haspopup': 'dialog' as const,
  }

  return (
    // #register is reserved for the panel, so this section is #interest.
    <section id="interest" className={`${styles.section}${hot ? ` ${styles.hot}` : ''}`} aria-labelledby="interest-title">
      <div className={styles.photo} ref={stage}>
        <img
          src={`${base}thespark/${img.name}.webp`}
          srcSet={`${base}thespark/${img.name}-sm.webp 720w, ${base}thespark/${img.name}-md.webp 1100w, ${base}thespark/${img.name}.webp ${img.width}w`}
          sizes="100vw"
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading="lazy"
          decoding="async"
        />
        <a className={styles.hit} href={registerMailto()} aria-label={envelope.openLabel} tabIndex={tabIndex} {...hotProps}>
          <span className={styles.ring} />
          <span className={styles.tag} aria-hidden="true">
            {envelope.hint}
          </span>
        </a>
        <p className={styles.credit}>{envelope.credit}</p>
      </div>

      <div className={styles.bar}>
        <div className={styles.text}>
          <p className={pageStyles.kicker}>{interest.kicker}</p>
          <h2 id="interest-title" className={pageStyles.h2}>
            {interest.title}
          </h2>
          <p className={pageStyles.interestBody}>{interest.body}</p>
        </div>
        <a className={pageStyles.button} href={registerMailto()} tabIndex={tabIndex} {...hotProps}>
          {interest.label}
        </a>
      </div>

      {/* The sequence layer: hidden until a click, never over the form. */}
      <div className={styles.gate} ref={gate} aria-hidden="true" onClick={() => busy.current && finish()}>
        <div className={styles.veil} ref={veil} />
        <div className={styles.clone} ref={clone}>
          {/* src is set on click from the banner's own image (already loaded, same resolution) */}
          <img alt="" />
        </div>
        <div className={styles.gl} ref={glHost} />
        <p className={styles.skip} ref={hint}>
          {envelope.skip}
        </p>
      </div>
    </section>
  )
}
