/**
 * The entry state machine:
 *
 *   loading → revealing → idle → entering → entered
 *
 * - loading:   critical fonts + portal assets are fetched. Nothing fake is shown.
 *              If the art takes longer than TIMING.patienceMs, the text is revealed
 *              on its own and the art follows when it arrives (or never, if it fails).
 * - revealing: the entrance timeline runs. "Skip animation" jumps to its end.
 * - idle:      artwork breathes; the CTA is live.
 * - entering:  the portal transition runs; repeat activation is ignored.
 * - entered:   the route changes to /retreats.
 *
 * Every phase has a non-animated path: reduced motion goes straight to idle and
 * uses a short dissolve; a missing or failed portal never blocks the CTA.
 */
import gsap from 'gsap'
import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { applyArchClip, archCoversViewport } from './archPath'
import { createController, type ArchRect } from './controller'
import type { PortalManifest } from './manifest'
import { TIMING } from './timing'

export type Phase = 'loading' | 'revealing' | 'idle' | 'entering' | 'entered'
/** How the artwork is currently rendered. */
export type PortalMode = 'pending' | 'webgl' | 'static'

export type MachineRefs = {
  wordmark: RefObject<HTMLElement | null>
  copy: RefObject<HTMLElement | null>[]
  slot: RefObject<HTMLElement | null>
  staticArt: RefObject<HTMLElement | null>
  destination: RefObject<HTMLElement | null>
}

type Options = {
  refs: MachineRefs
  mode: PortalMode
  reducedMotion: boolean
  geometry: Pick<PortalManifest, 'aperture' | 'arch'>
  onEntered: () => void
}

export function usePortalMachine(options: Options) {
  const opts = useRef(options)
  useLayoutEffect(() => {
    opts.current = options
  })

  const controller = useMemo(createController, [])
  useEffect(() => {
    // Opt-in inspection hook for tuning (dev server, or ?portal-debug in production).
    if (import.meta.env.DEV || window.location.search.includes('portal-debug')) {
      ;(window as unknown as { __scintillart?: object }).__scintillart = { gsap, controller }
    }
  }, [controller])
  const [phase, setPhaseState] = useState<Phase>(options.reducedMotion ? 'idle' : 'loading')
  const phaseRef = useRef<Phase>(phase)
  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }, [])

  const flags = useRef({ fontsReady: false, artReady: false, artFailed: false, textShown: false, artShown: false })
  const timelines = useRef<gsap.core.Timeline[]>([])
  const enterTl = useRef<gsap.core.Timeline | null>(null)
  const patience = useRef<number | undefined>(undefined)

  const track = (tl: gsap.core.Timeline) => {
    timelines.current.push(tl)
    return tl
  }
  const copyEls = () => opts.current.refs.copy.map((r) => r.current).filter(Boolean) as HTMLElement[]

  // Before first paint: put animated elements in their pre-reveal state.
  useLayoutEffect(() => {
    const { refs, reducedMotion } = opts.current
    if (reducedMotion) {
      controller.reveal = 1
      controller.sweep = 2
      flags.current.textShown = true
      return
    }
    gsap.set(refs.wordmark.current, { opacity: 0, yPercent: 14 })
    gsap.set(copyEls(), { opacity: 0, y: 14 })
    gsap.set(refs.staticArt.current, { opacity: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(patience.current)
      timelines.current.forEach((t) => t.kill())
      enterTl.current?.kill()
      controller.onArch = null
    },
    [controller],
  )

  /** Text-only part of the reveal. */
  const addText = (tl: gsap.core.Timeline, at: number) => {
    const R = TIMING.reveal
    const { refs } = opts.current
    tl.to(refs.wordmark.current, { opacity: 1, yPercent: 0, duration: R.wordmark, ease: 'power3.out' }, at)
    tl.to(copyEls(), { opacity: 1, y: 0, duration: R.copy, stagger: R.copyStagger, ease: 'power2.out' }, at + R.copyAt)
  }

  /** Artwork part of the reveal: layers separate, one light sweep. */
  const addArt = (tl: gsap.core.Timeline, at: number) => {
    const R = TIMING.reveal
    const { refs, mode } = opts.current
    if (mode === 'webgl') {
      tl.fromTo(controller, { reveal: 0 }, { reveal: 1, duration: R.layers, ease: 'power2.inOut' }, at + R.layersAt)
      tl.fromTo(controller, { sweep: -0.5 }, { sweep: 1.6, duration: R.sweep, ease: 'sine.inOut' }, at + R.sweepAt)
    } else if (refs.staticArt.current) {
      tl.fromTo(
        refs.staticArt.current,
        { opacity: 0, scale: 0.985 },
        { opacity: 1, scale: 1, duration: R.layers, ease: 'power2.out' },
        at + R.layersAt,
      )
    }
  }

  const finishReveal = () => {
    if (phaseRef.current === 'revealing') setPhase('idle')
  }

  const fullReveal = () => {
    const f = flags.current
    f.textShown = true
    f.artShown = true
    setPhase('revealing')
    const tl = track(gsap.timeline({ onComplete: finishReveal }))
    addText(tl, 0)
    addArt(tl, 0)
  }

  const textOnlyReveal = () => {
    flags.current.textShown = true
    setPhase('revealing')
    const tl = track(gsap.timeline({ onComplete: finishReveal }))
    addText(tl, 0)
  }

  const artOnlyReveal = () => {
    flags.current.artShown = true
    const tl = track(gsap.timeline())
    addArt(tl, 0)
  }

  const evaluate = () => {
    const f = flags.current
    if (opts.current.reducedMotion) return
    if (!f.fontsReady) return
    if (!f.textShown) {
      if (f.artReady) fullReveal()
      else if (f.artFailed) textOnlyReveal()
      else if (patience.current === undefined) {
        patience.current = window.setTimeout(() => {
          if (!flags.current.textShown) textOnlyReveal()
        }, TIMING.patienceMs)
      }
      return
    }
    if (f.artReady && !f.artShown) artOnlyReveal()
  }

  /** Critical fonts are loaded (or timed out). */
  const fontsReady = useCallback(() => {
    flags.current.fontsReady = true
    evaluate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** The artwork (WebGL scene or static image) is ready to be revealed. */
  const artReady = useCallback(() => {
    flags.current.artReady = true
    if (opts.current.reducedMotion || phaseRef.current === 'entering' || phaseRef.current === 'entered') {
      flags.current.artShown = true
      controller.reveal = 1
      gsap.set(opts.current.refs.staticArt.current, { opacity: 1 })
      return
    }
    evaluate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** No artwork is available at all. The page still works. */
  const artFailed = useCallback(() => {
    flags.current.artFailed = true
    evaluate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Called when WebGL fails after the art was already shown: swap in the static image. */
  const showStaticArtNow = useCallback(() => {
    gsap.to(opts.current.refs.staticArt.current, { opacity: 1, scale: 1, duration: 0.4, overwrite: true })
  }, [])

  const finishEnter = useCallback(() => {
    const dest = opts.current.refs.destination.current
    controller.onArch = null
    if (dest) {
      applyArchClip(dest, null)
      gsap.set(dest, { opacity: 1 })
    }
    setPhase('entered')
    opts.current.onEntered()
  }, [controller, setPhase])

  const enter = useCallback(() => {
    const ph = phaseRef.current
    if (ph === 'entering' || ph === 'entered') return
    const { refs, reducedMotion, mode, geometry } = opts.current

    // Complete any running reveal first so everything starts from its final state.
    window.clearTimeout(patience.current)
    timelines.current.forEach((t) => t.progress(1))
    if (!reducedMotion) gsap.set([refs.wordmark.current, ...copyEls()], { opacity: 1, y: 0, yPercent: 0 })
    setPhase('entering')

    const dest = refs.destination.current
    if (!dest) {
      finishEnter()
      return
    }
    gsap.set(dest, { visibility: 'visible', opacity: 0 })

    if (reducedMotion) {
      applyArchClip(dest, null)
      enterTl.current = gsap
        .timeline({ onComplete: finishEnter })
        .to(dest, { opacity: 1, duration: TIMING.reducedMotionDissolve, ease: 'none' })
      return
    }

    const E = TIMING.enter
    const tl = gsap.timeline({ onComplete: finishEnter })
    enterTl.current = tl

    if (window.scrollY > 2) {
      // On small screens the visitor may have scrolled down to the CTA: glide back to the portal first.
      const proxy = { y: window.scrollY }
      tl.to(proxy, { y: 0, duration: E.scrollToTop, ease: 'power2.inOut', onUpdate: () => window.scrollTo(0, proxy.y) })
    }
    tl.addLabel('go')
    tl.to(copyEls(), { opacity: 0, y: 8, duration: E.copyOut, ease: 'power1.in' }, 'go')
    tl.to(refs.wordmark.current, { opacity: 0, yPercent: -55, duration: E.wordmarkOut, ease: 'power2.in' }, 'go')

    const writeArch = (rect: ArchRect) => applyArchClip(dest, archCoversViewport(rect) ? null : rect)

    if (mode === 'webgl' && flags.current.artShown) {
      // The scene reports the projected doorway arch every frame; the destination is clipped to it.
      applyArchClip(dest, { left: 0, top: 0, width: 0, height: 0 })
      controller.onArch = writeArch
      tl.to(controller, { open: 1, duration: E.open, ease: 'power2.inOut' }, 'go')
      tl.to(controller, { enter: 1, duration: E.travel, ease: 'power2.in' }, `go+=${E.travelAt}`)
    } else if (refs.staticArt.current && refs.slot.current) {
      // Static fallback: zoom the flat collage into the doorway, revealing the destination through the same arch.
      const art = refs.staticArt.current
      const slot = refs.slot.current
      const { aperture: a, arch } = geometry
      gsap.set(art, { transformOrigin: `${a.cx * 100}% ${a.cy * 100}%`, willChange: 'transform' })
      applyArchClip(dest, { left: 0, top: 0, width: 0, height: 0 })
      const proxy = { e: 0, s: 1 }
      const r0 = slot.getBoundingClientRect()
      const archPx = Math.min((arch.x1 - arch.x0) * r0.width, (arch.bottom - arch.top) * r0.height) || 1
      const sEnd = Math.max(12, (2.4 * Math.max(window.innerWidth, window.innerHeight)) / archPx)
      tl.to(
        proxy,
        {
          e: 1,
          duration: E.travel,
          ease: 'power2.in',
          onUpdate: () => {
            proxy.s = Math.pow(sEnd, proxy.e) // geometric zoom: even perceived speed
            gsap.set(art, { scale: proxy.s })
            const r = slot.getBoundingClientRect()
            const ox = r.left + a.cx * r.width
            const oy = r.top + a.cy * r.height
            writeArch({
              left: ox + (arch.x0 - a.cx) * r.width * proxy.s,
              top: oy + (arch.top - a.cy) * r.height * proxy.s,
              width: (arch.x1 - arch.x0) * r.width * proxy.s,
              height: (arch.bottom - arch.top) * r.height * proxy.s,
            })
          },
        },
        `go+=${E.travelAt}`,
      )
    } else {
      applyArchClip(dest, null)
    }

    tl.fromTo(dest, { opacity: 0 }, { opacity: 1, duration: E.destination, ease: 'power1.inOut' }, `go+=${E.destinationAt}`)
  }, [controller, finishEnter, setPhase])

  /** "Skip animation": jump the running timeline to its end. */
  const skip = useCallback(() => {
    if (phaseRef.current === 'revealing') {
      window.clearTimeout(patience.current)
      timelines.current.forEach((t) => t.progress(1))
      setPhase('idle')
    } else if (phaseRef.current === 'entering') {
      enterTl.current?.progress(1)
    }
  }, [setPhase])

  return { phase, controller, fontsReady, artReady, artFailed, showStaticArtNow, enter, skip }
}
