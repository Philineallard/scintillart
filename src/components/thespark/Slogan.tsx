import { useCallback, useEffect, useRef } from 'react'
import styles from './Slogan.module.css'

/**
 * "Where a spark becomes art.": the spark becomes art.
 *
 * A fine four-point star ignites above "spark", sheds a few embers (gravity, drag,
 * flicker), travels in an arc over "becomes" on a hair-thin tapering trail, and lands
 * under "art." as a pen-stroke flourish that wipes away after a moment.
 *
 * Antique brass, flat (decorative only, no glow). Plays once when the line comes into
 * view and again on hover; nothing with prefers-reduced-motion. Drawn on a canvas that
 * is decoration only (aria-hidden): the sentence stays plain text. No browser APIs or
 * randomness during render, so the pre-rendered HTML hydrates cleanly.
 */

type Pt = { x: number; y: number }
type Ember = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; phase: number }

// Timeline (ms).
const IGNITE = 260 // the star opens
const FLIGHT = 1550 // spark travels to the end of the flourish
const HOLD = 650 // flourish rests under "art."
const WIPE = 650 // flourish wipes away, left to right
const TOTAL = IGNITE + FLIGHT + HOLD + WIPE

const PAD = { x: 28, top: 84, bottom: 28 } // canvas reaches beyond the text by this much

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number, out: Pt[]) {
  for (let i = out.length ? 1 : 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    })
  }
}

/** Points along the whole stroke, their running lengths, and where the flourish starts. */
function buildPath(spark: DOMRect, art: DOMRect, origin: DOMRect) {
  const ox = origin.left - PAD.x
  const oy = origin.top - PAD.top
  const h = art.height
  const start = { x: spark.left - ox + spark.width * 0.62, y: spark.top - oy + h * 0.12 }
  const base = art.top - oy + h * 0.9 // a little under the baseline
  const u0 = { x: art.left - ox - h * 0.15, y: base - h * 0.2 } // the swash dips below this
  const u1 = { x: art.right - ox + h * 0.1, y: base - 2 }
  const tip = { x: u1.x + h * 0.22, y: base - h * 0.38 }
  const lift = Math.min(h * 1.9, PAD.top - 14)

  const pts: Pt[] = []
  // The arc: up from "spark", over "becomes", down through the gap into the flourish.
  const arcC2 = { x: u0.x - h * 0.05, y: start.y - lift * 0.95 }
  cubic(start, { x: start.x + (u0.x - start.x) * 0.22, y: start.y - lift * 1.15 }, arcC2, u0, 90, pts)
  const flourishIndex = pts.length - 1
  // The flourish: carries on down out of the descent (same direction, so no corner),
  // swings right under "art." like a pen swash, then a small upward stroke.
  const dir = { x: u0.x - arcC2.x, y: u0.y - arcC2.y } // the descent's direction where it meets the flourish
  const k = (h * 0.5) / Math.hypot(dir.x, dir.y)
  cubic(u0, { x: u0.x + dir.x * k, y: u0.y + dir.y * k }, { x: u1.x - (u1.x - u0.x) * 0.45, y: base + 4 }, u1, 48, pts)
  cubic(u1, { x: u1.x + h * 0.12, y: base - 3 }, { x: tip.x - 2, y: tip.y + h * 0.12 }, tip, 14, pts)

  const len = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
  return { pts, len, total: len[len.length - 1], flourishAt: len[flourishIndex] }
}

function pointAt(path: ReturnType<typeof buildPath>, d: number): Pt {
  const { pts, len } = path
  let i = 1
  while (i < len.length - 1 && len[i] < d) i++
  const a = pts[i - 1]
  const b = pts[i]
  const t = clamp01((d - len[i - 1]) / (len[i] - len[i - 1] || 1))
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

export function Slogan({ text, className }: { text: string; className?: string }) {
  const rootRef = useRef<HTMLParagraphElement>(null)
  const sparkRef = useRef<HTMLSpanElement>(null)
  const artRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playing = useRef(false)
  const frame = useRef(0)

  const play = useCallback(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const sparkEl = sparkRef.current
    const artEl = artRef.current
    if (playing.current || !root || !canvas || !sparkEl || !artEl) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    playing.current = true

    // Size the canvas to the line (plus room for the arc) at device resolution.
    const box = root.getBoundingClientRect()
    const w = box.width + PAD.x * 2
    const h = box.height + PAD.top + PAD.bottom
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const colour = getComputedStyle(root).getPropertyValue('--antique-brass').trim() || '#b59661'
    const path = buildPath(sparkEl.getBoundingClientRect(), artEl.getBoundingClientRect(), box)
    const comet = Math.min(90, path.flourishAt * 0.45) // length of the trail behind the spark in flight
    const embers: Ember[] = []

    const emit = (at: Pt, n: number, speed: number, up: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const s = speed * (0.35 + Math.random() * 0.65)
        embers.push({
          x: at.x,
          y: at.y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - up,
          life: 380 + Math.random() * 620,
          age: 0,
          size: 0.6 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    const star = (at: Pt, r: number, angle: number, alpha: number) => {
      if (r <= 0 || alpha <= 0) return
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(at.x, at.y)
      ctx.rotate(angle)
      ctx.fillStyle = colour
      // Four slender rays: a long vertical, a shorter horizontal.
      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.lineTo(r * 0.09, 0)
      ctx.lineTo(0, r)
      ctx.lineTo(-r * 0.09, 0)
      ctx.closePath()
      ctx.moveTo(-r * 0.62, 0)
      ctx.lineTo(0, r * 0.08)
      ctx.lineTo(r * 0.62, 0)
      ctx.lineTo(0, -r * 0.08)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, 0, Math.max(0.8, r * 0.11), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    /** The stroke between two distances, tapering from `w0` to `w1`. */
    const stroke = (from: number, to: number, w0: number, w1: number, alpha: number) => {
      if (to - from < 0.5 || alpha <= 0) return
      const { pts, len } = path
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = colour
      ctx.lineCap = 'round'
      let prev = pointAt(path, from)
      for (let i = 1; i < pts.length; i++) {
        if (len[i] <= from) continue
        const d = Math.min(len[i], to)
        const p = d === len[i] ? pts[i] : pointAt(path, d)
        const t = (d - from) / (to - from)
        ctx.lineWidth = w0 + (w1 - w0) * t
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        prev = p
        if (d >= to) break
      }
      ctx.restore()
    }

    /** The flourish as a pen stroke: its width depends on where along the flourish it is, not on the head. */
    const pen = (from: number, to: number) => {
      const { pts, len, flourishAt, total } = path
      const span = total - flourishAt
      ctx.save()
      ctx.strokeStyle = colour
      ctx.lineCap = 'round'
      let prev = pointAt(path, from)
      for (let i = 1; i < pts.length; i++) {
        if (len[i] <= from) continue
        const d = Math.min(len[i], to)
        const p = d === len[i] ? pts[i] : pointAt(path, d)
        const u = (d - flourishAt) / span
        ctx.lineWidth = 0.35 + 1.15 * Math.sin(Math.PI * Math.pow(u, 0.8))
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        prev = p
        if (d >= to) break
      }
      ctx.restore()
    }

    const startPoint = path.pts[0]
    let ignited = false
    let landed = false
    let last = performance.now()
    const t0 = last

    const tick = (now: number) => {
      const dt = Math.min(48, now - last)
      last = now
      const t = now - t0
      ctx.clearRect(0, 0, w, h)

      // 1. Ignition.
      if (!ignited) {
        ignited = true
        emit(startPoint, 14, 0.09, 0.03)
      }
      const igniteT = clamp01(t / IGNITE)

      // 2. Flight: head and tail along the path.
      const flightT = clamp01((t - IGNITE) / FLIGHT)
      const head = path.total * easeInOut(flightT)
      // In flight the tail follows at `comet`; once the head writes the flourish, the tail
      // catches up so the flourish is all that is left when the head reaches its end.
      const flourishLen = path.total - path.flourishAt
      const writing = clamp01((head - path.flourishAt) / flourishLen)
      let tail = Math.min(Math.max(0, head - comet * (1 - writing)), path.flourishAt)
      // 4. Wipe: the flourish clears from left to right.
      const wipeT = clamp01((t - IGNITE - FLIGHT - HOLD) / WIPE)
      if (wipeT > 0) tail = path.flourishAt + (path.total - path.flourishAt) * easeInOut(wipeT)

      if (flightT > 0) {
        // The part still in flight tapers to the head; the flourish under "art." is an even pen line.
        const inFlightEnd = Math.min(head, path.flourishAt)
        if (inFlightEnd > tail) stroke(tail, inFlightEnd, 0.2, 1.1, 0.9)
        if (head > path.flourishAt) pen(Math.max(tail, path.flourishAt), head)
        // A thin ember trail from the moving head.
        if (flightT < 1 && Math.random() < 0.55) {
          const p = pointAt(path, head)
          emit(p, 1, 0.025, 0)
        }
      }

      // The star: opens at "spark", rides the head, closes when it lands.
      const headPt = flightT > 0 ? pointAt(path, head) : startPoint
      const opening = easeOut(igniteT)
      const closing = flightT >= 1 ? clamp01((t - IGNITE - FLIGHT) / 380) : 0
      if (flightT >= 1 && !landed) {
        landed = true
        emit(headPt, 7, 0.06, 0.02)
      }
      const flicker = 0.92 + 0.08 * Math.sin(t * 0.045)
      star(headPt, (7.5 + 1.5 * Math.sin(t * 0.012)) * opening * (1 - easeOut(closing)) * flicker, t * 0.0016, 1 - closing)

      // 3. Embers: gravity, drag, flicker.
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]
        e.age += dt
        if (e.age >= e.life) {
          embers.splice(i, 1)
          continue
        }
        e.vy += 0.00022 * dt // gravity (px/ms²)
        e.vx *= 1 - 0.0022 * dt
        e.vy *= 1 - 0.0014 * dt
        e.x += e.vx * dt
        e.y += e.vy * dt
        const k = 1 - e.age / e.life
        ctx.globalAlpha = k * (0.6 + 0.4 * Math.sin(e.phase + e.age * 0.05))
        ctx.fillStyle = colour
        ctx.fillRect(e.x - e.size / 2, e.y - e.size / 2, e.size, e.size)
      }
      ctx.globalAlpha = 1

      if (t < TOTAL || embers.length) {
        frame.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, w, h)
        playing.current = false
      }
    }
    frame.current = requestAnimationFrame(tick)
  }, [])

  // Once, when the line is fully in view.
  useEffect(() => {
    const el = rootRef.current
    if (!el || !('IntersectionObserver' in window)) return
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = window.setTimeout(play, 350)
          io.disconnect()
        }
      },
      { threshold: 1 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
      cancelAnimationFrame(frame.current)
      playing.current = false
    }
  }, [play])

  const parts = text.split(/\b(spark|art)\b/)

  return (
    <p ref={rootRef} className={`${className ?? ''} ${styles.slogan}`} onPointerEnter={play}>
      {parts.map((part, i) =>
        part === 'spark' ? (
          <span key={i} ref={sparkRef}>
            {part}
          </span>
        ) : part === 'art' ? (
          <span key={i} ref={artRef}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </p>
  )
}
