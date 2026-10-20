import { useEffect, useRef } from 'react'
import styles from './ScintillaCursor.module.css'

/**
 * Custom cursor for mouse users: a small ink point with a trailing ring, which
 * scatters tiny four-point sparks and sends out soft ripples as it moves.
 * Colours are taken from the collage (rose, clay, holographic teal, foil, amethyst, gold).
 *
 * - Only for a fine, hovering pointer, and never with prefers-reduced-motion.
 * - One 2D canvas, drawn only while sparks/ripples are alive; idle cost is zero.
 * - Decorative: aria-hidden, pointer-events: none.
 */

const COLOURS = ['#c49a91', '#a46b52', '#5fc9b5', '#b8c4b6', '#8a5a9e', '#c99a5b', '#e8b8a0']

const TUNING = {
  ringLerp: 0.18, // how quickly the ring catches up with the point
  sparkEveryPx: 14, // distance travelled between sparks
  rippleEveryPx: 110, // distance travelled between ripples
  sparkLife: 1150, // ms
  rippleLife: 1100, // ms
  rippleRadius: 46, // px
  clickRippleRadius: 90, // px
  maxParticles: 160,
}

type Spark = { x: number; y: number; vx: number; vy: number; size: number; born: number; colour: string; spin: number }
type Ripple = { x: number; y: number; born: number; radius: number; colour: string }

type Variant = 'spark' | 'holo'

/**
 * `spark`: collage colours (entry page).
 * `holo`:  the holographic foil of the collage: hues shift with position and time,
 *          like light catching the prism foil (retreats page).
 */
export function ScintillaCursor({ variant = 'spark' }: { variant?: Variant }) {
  const layerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!fine || reduced || !canvas || !dot || !ring) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    document.documentElement.classList.add('has-scintilla-cursor')

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const sparks: Spark[] = []
    const ripples: Ripple[] = []
    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    let last: { x: number; y: number } | null = null
    let sinceSpark = 0
    let sinceRipple = 0
    let frame = 0
    let visible = false
    const holo = () => layerRef.current?.dataset.variant === 'holo'
    // Iridescent hue: drifts with position and time, so the trail runs through the spectrum.
    const holoColour = (x: number, y: number, light = 68) =>
      `hsl(${(x * 0.25 + y * 0.18 + performance.now() * 0.06) % 360} 90% ${light}%)`
    const pick = (x = pos.x, y = pos.y) =>
      holo() ? holoColour(x + Math.random() * 120, y) : COLOURS[(Math.random() * COLOURS.length) | 0]

    const addSpark = (x: number, y: number, speed: number) => {
      if (sparks.length >= TUNING.maxParticles) sparks.shift()
      const a = Math.random() * Math.PI * 2
      const v = 0.02 + Math.random() * 0.04 + Math.min(speed, 40) * 0.0015
      sparks.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 0.015, // a little lift
        size: 3.5 + Math.random() * 5,
        born: performance.now(),
        colour: pick(x, y),
        spin: Math.random() * Math.PI,
      })
    }
    const addRipple = (x: number, y: number, radius: number) => {
      ripples.push({ x, y, born: performance.now(), radius, colour: pick(x, y) })
    }

    // Four-point star, like the cut foil glints in the collage.
    const star = (x: number, y: number, r: number, rot: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rot)
      ctx.beginPath()
      ctx.moveTo(r, 0)
      for (let i = 1; i <= 4; i++) {
        const a = (i * Math.PI) / 2
        const c = a - Math.PI / 4 // pinch toward the centre between the points
        ctx.quadraticCurveTo(Math.cos(c) * r * 0.18, Math.sin(c) * r * 0.18, Math.cos(a) * r, Math.sin(a) * r)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const draw = (now: number) => {
      frame = 0
      // Ring and point (DOM transforms; no layout reads).
      ringPos.x += (pos.x - ringPos.x) * TUNING.ringLerp
      ringPos.y += (pos.y - ringPos.y) * TUNING.ringLerp
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        const t = (now - r.born) / TUNING.rippleLife
        if (t >= 1) {
          ripples.splice(i, 1)
          continue
        }
        const e = 1 - Math.pow(1 - t, 3)
        ctx.globalAlpha = (1 - t) * 0.55
        ctx.strokeStyle = r.colour
        ctx.lineWidth = 1.25
        // Holographic ripples carry the whole spectrum around the ring, slowly turning.
        if (holo() && 'createConicGradient' in ctx) {
          const g = ctx.createConicGradient(now * 0.0015, r.x, r.y)
          ;[0, 60, 120, 180, 240, 300, 360].forEach((h, i) => g.addColorStop(i / 6, `hsl(${h} 90% 66%)`))
          ctx.strokeStyle = g
          ctx.lineWidth = 1.6
        }
        ctx.beginPath()
        ctx.arc(r.x, r.y, 4 + e * r.radius, 0, Math.PI * 2)
        ctx.stroke()
        // a second, fainter ring trailing behind, like water
        if (t > 0.15) {
          const e2 = 1 - Math.pow(1 - (t - 0.15) / 0.85, 3)
          ctx.globalAlpha = (1 - t) * 0.3
          ctx.beginPath()
          ctx.arc(r.x, r.y, 4 + e2 * r.radius * 0.62, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        const age = now - s.born
        const t = age / TUNING.sparkLife
        if (t >= 1) {
          sparks.splice(i, 1)
          continue
        }
        s.x += s.vx * 16
        s.y += s.vy * 16
        // twinkle: grow quickly, shimmer, shrink
        const twinkle = Math.sin(t * Math.PI) * (0.75 + 0.25 * Math.sin(age * 0.03 + s.spin))
        ctx.globalAlpha = Math.min(1, (1 - t) * 1.4)
        ctx.fillStyle = s.colour
        ctx.shadowColor = s.colour
        ctx.shadowBlur = 6
        star(s.x, s.y, s.size * twinkle, s.spin + t * 1.6)
        ctx.shadowBlur = 0
      }
      ctx.globalAlpha = 1

      const settling = Math.abs(pos.x - ringPos.x) + Math.abs(pos.y - ringPos.y) > 0.3
      if (sparks.length || ripples.length || settling) frame = requestAnimationFrame(draw)
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) {
        visible = true
        ringPos.x = pos.x
        ringPos.y = pos.y
        dot.dataset.visible = ''
        ring.dataset.visible = ''
      }
      if (last) {
        const d = Math.hypot(pos.x - last.x, pos.y - last.y)
        sinceSpark += d
        sinceRipple += d
        while (sinceSpark >= TUNING.sparkEveryPx) {
          sinceSpark -= TUNING.sparkEveryPx
          addSpark(pos.x, pos.y, d)
        }
        if (sinceRipple >= TUNING.rippleEveryPx) {
          sinceRipple = 0
          addRipple(pos.x, pos.y, TUNING.rippleRadius)
        }
      }
      last = { x: pos.x, y: pos.y }
      kick()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      addRipple(e.clientX, e.clientY, TUNING.clickRippleRadius)
      for (let i = 0; i < 10; i++) addSpark(e.clientX, e.clientY, 30)
      ring.dataset.pressed = ''
      kick()
    }
    const onUp = () => {
      delete ring.dataset.pressed
    }
    const onOver = (e: PointerEvent) => {
      const interactive = (e.target as Element | null)?.closest?.('a, button, [role="button"], label, summary')
      if (interactive) ring.dataset.hover = ''
      else delete ring.dataset.hover
    }
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget) return
      visible = false
      last = null
      delete dot.dataset.visible
      delete ring.dataset.visible
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onLeave, { passive: true })
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('has-scintilla-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div ref={layerRef} className={styles.layer} data-variant={variant} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={ringRef} className={styles.ring} />
      <div ref={dotRef} className={styles.dot} />
    </div>
  )
}
