import { useEffect, useRef } from 'react'
import { GLINT } from './glintConfig'
import styles from './RefractionGlints.module.css'

/**
 * Subtle prismatic glints for content pages: now and then, as the pointer moves,
 * a thin irregular sliver of light appears slightly behind it, drifts a little and
 * dissolves, with a faint rose/mint separation at its edges, like the collage's
 * foil catching the sun.
 *
 * Honest scope: this is a lightweight 2D canvas drawing translucent light fragments.
 * It does not refract the page behind it. It is drawn BEHIND all content, so text,
 * links and photographs are never touched, and it never spawns over interactive
 * elements or images. The normal cursor is kept. Mouse only; off for reduced motion.
 */

type Glint = {
  x: number
  y: number
  angle: number
  length: number
  width: number
  skew: number
  drift: number
  born: number
  sharp: boolean
}

const QUIET_OVER = 'a, button, input, textarea, select, label, summary, [role="button"], img, video'

export function RefractionGlints() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canvas || !fine || reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const glints: Glint[] = []
    const history: { x: number; y: number; t: number }[] = []
    let travel = 0
    let nextAt = GLINT.frequency * (0.6 + Math.random() * 0.8)
    let frame = 0

    // A position from ~70 ms ago: the glint appears slightly behind the pointer.
    const lagged = (now: number) => {
      for (let i = history.length - 1; i >= 0; i--) if (now - history[i].t >= 70) return history[i]
      return history[0]
    }

    const spawn = (now: number, speed: number, dirX: number, dirY: number) => {
      const p = lagged(now)
      if (!p) return
      const s = GLINT.highlightSize
      // Faster movement = a slightly longer streak, never more particles.
      const length = (16 + Math.min(1, speed / 2200) * 52 + Math.random() * 10) * s
      glints.push({
        x: p.x + (Math.random() - 0.5) * 10,
        y: p.y + (Math.random() - 0.5) * 10,
        angle: Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 0.9,
        length,
        width: (2.4 + Math.random() * 2.6) * s,
        skew: (Math.random() - 0.5) * 0.6,
        drift: 6 + Math.random() * 8,
        born: now,
        sharp: Math.random() < 0.35,
      })
      if (glints.length > 4) glints.shift()
    }

    // One sliver: an irregular, tapered quadrilateral along its axis.
    const sliver = (g: Glint, offset: number) => {
      const half = g.length / 2
      const w = g.width
      ctx.beginPath()
      ctx.moveTo(-half, offset)
      ctx.lineTo(g.skew * half, -w * 0.55 + offset)
      ctx.lineTo(half, offset + g.skew * w * 0.4)
      ctx.lineTo(g.skew * half * 0.6, w * 0.45 + offset)
      ctx.closePath()
    }

    const draw = (now: number) => {
      frame = 0
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = glints.length - 1; i >= 0; i--) {
        const g = glints[i]
        const t = (now - g.born) / GLINT.fadeDuration
        if (t >= 1) {
          glints.splice(i, 1)
          continue
        }
        // Quick catch of light, then a long dissolve.
        const a = Math.min(1, t / 0.12) * Math.pow(1 - t, 1.6) * GLINT.intensity
        const d = g.drift * (1 - Math.pow(1 - t, 2))
        ctx.save()
        ctx.translate(g.x + Math.cos(g.angle) * d, g.y + Math.sin(g.angle) * d)
        ctx.rotate(g.angle)

        const half = g.length / 2
        const body = ctx.createLinearGradient(-half, 0, half, 0)
        body.addColorStop(0, 'rgba(255, 248, 232, 0)')
        body.addColorStop(0.45, `rgba(255, 246, 226, ${a})`)
        body.addColorStop(0.6, `rgba(248, 232, 196, ${a * 0.85})`) // pale gold/champagne
        body.addColorStop(1, 'rgba(255, 248, 232, 0)')

        // Faint colour separation at the edges (normal blending, very low alpha).
        const sep = GLINT.colourSeparation
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = `rgba(214, 150, 142, ${a * 0.45})` // rose
        sliver(g, -sep)
        ctx.fill()
        ctx.fillStyle = `rgba(150, 196, 178, ${a * 0.45})` // muted mint
        sliver(g, sep)
        ctx.fill()

        // The light itself brightens what's beneath it, with only a whisper of glow.
        ctx.globalCompositeOperation = 'lighter'
        ctx.shadowColor = `rgba(255, 244, 220, ${a * 0.6})`
        ctx.shadowBlur = 4
        ctx.fillStyle = body
        sliver(g, 0)
        ctx.fill()
        ctx.shadowBlur = 0

        // Occasionally a fine, sharp edge, like the cut side of glass.
        if (g.sharp) {
          ctx.globalCompositeOperation = 'source-over'
          ctx.strokeStyle = `rgba(120, 98, 78, ${a * 0.28})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(-half * 0.8, g.width * 0.5)
          ctx.lineTo(half * 0.7, g.width * 0.5 + g.skew * g.width * 0.4)
          ctx.stroke()
        }
        ctx.restore()
      }
      ctx.globalCompositeOperation = 'source-over'
      if (glints.length) frame = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const now = performance.now()
      const prev = history[history.length - 1]
      history.push({ x: e.clientX, y: e.clientY, t: now })
      while (history.length > 12) history.shift()
      if (!prev) return
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      const dist = Math.hypot(dx, dy)
      if (dist < 0.5) return
      // Quiet over links, buttons, fields and photographs.
      if ((e.target as Element | null)?.closest?.(QUIET_OVER)) return
      travel += dist
      if (travel < nextAt) return
      travel = 0
      nextAt = GLINT.frequency * (0.6 + Math.random() * 0.8)
      const speed = dist / Math.max(1, now - prev.t) * 1000
      spawn(now, speed, dx / dist, dy / dist)
      if (!frame) frame = requestAnimationFrame(draw)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
