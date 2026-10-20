import { useEffect, useRef } from 'react'
import { FLUID_GLSL, pointerTrail, TRAIL_N } from '../fluid/pointerTrail'
import styles from './Atmosphere.module.css'

/**
 * The page background, built as four layers (back to front):
 *
 *   1. Base colour          warm ivory on <html> (tokens.css: --paper)
 *   2. Light/shadow field   this WebGL canvas: domain-warped noise, drifting very slowly,
 *                           drawn at low resolution and stretched, so it is soft by nature
 *   3. Fine grain           static, barely-there dithering (CSS layer)
 *   4. Vignette             a faint darkening toward the edges (CSS layer)
 *
 * The canvas is the only moving part. Without WebGL, or with reduced motion, the field
 * is a static CSS approximation (or a single still frame). Text sits above all of it.
 */

const TUNING = {
  /** Render scale of the light field relative to CSS pixels (low = softer, cheaper). */
  resolution: 0.22,
  /** Frames per second for the drift; the motion is slow enough that this is invisible. */
  fps: 24,
  /** Drift speed of the light field. */
  speed: 0.018,
  /** How strongly the pointer disturbs the field, and how slowly it settles. */
  pointerStrength: 0.55,
  pointerDamping: 1.6,
}

const vertex = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const fragment = /* glsl */ `
precision mediump float;
${FLUID_GLSL}
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;   // 0..1, y up
uniform float uPointerAmt;
uniform float uCement;     // 0 = ivory (content pages), 1 = cement (homepage)

// Value noise + fbm (smooth, no visible lattice at this resolution).
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = r * p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv0 = gl_FragCoord.xy / uRes;
  // Fluid-like disturbance from the pointer trail (homepage). Amplified here because the
  // light field is broad and soft; the surface shading below gives it a tactile edge.
  vec2 fd = fluidDisplace(uv0);
  vec2 uv = uv0 + fd * 3.2;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 0.85; // broad pools, no fine detail
  float t = uTime;

  // Broad, damped pointer disturbance: bends the flow locally, never a spotlight.
  vec2 d = (uv - uPointer) * vec2(aspect, 1.0);
  float g = exp(-dot(d, d) * 2.2) * uPointerAmt;

  // Domain warping: light moving through a translucent material.
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 1.6 * q + vec2(1.7, 9.2) + t * 0.45 + g * 0.9),
                fbm(p + 1.6 * q + vec2(8.3, 2.8) - t * 0.35 - g * 0.6));
  float f = fbm(p + 1.5 * r);

  // Content pages: warm ivory, muted stone, faint rose/clay.
  // Homepage (cement): light poured-concrete stones taken from the collage's kraft,
  // rose-clay and sage, a touch cooler and more mottled.
  vec3 stone = mix(vec3(0.855, 0.822, 0.776), vec3(0.808, 0.776, 0.737), uCement);
  vec3 ivory = mix(vec3(0.937, 0.912, 0.872), vec3(0.895, 0.868, 0.834), uCement);
  vec3 light = mix(vec3(0.968, 0.950, 0.918), vec3(0.935, 0.915, 0.886), uCement);
  vec3 rose  = mix(vec3(0.912, 0.842, 0.808), vec3(0.866, 0.784, 0.745), uCement);
  vec3 sage  = vec3(0.800, 0.812, 0.776);

  vec3 col = mix(stone, ivory, smoothstep(0.22, 0.72, f));
  col = mix(col, rose, smoothstep(0.45, 0.85, r.x) * 0.45);
  col = mix(col, light, smoothstep(0.6, 0.95, f) * 0.55);

  // Cement: mid-scale mottling (cloudy patches poured at different densities)
  // and a faint sage cast in places, like the collage's foil glints seen in stone.
  float m = fbm(p * 3.6 + vec2(3.1, 7.7) + q * 0.35);
  col *= 1.0 + (m - 0.5) * 0.09 * uCement;
  col = mix(col, sage, smoothstep(0.55, 0.85, q.y) * 0.25 * uCement);

  // Light catching the disturbed surface: a faint highlight on one slope, shade on the other.
  float slope = dot(fd, vec2(0.6, 0.8)) * 26.0;
  col *= 1.0 + clamp(slope, -0.035, 0.035);

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
}

export function Atmosphere({ fluid = false, cement = false }: { fluid?: boolean; cement?: boolean }) {
  const cementRef = useRef(cement)
  cementRef.current = cement
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fluidRef = useRef(fluid)
  fluidRef.current = fluid

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' })
    if (!gl) return // CSS fallback stays visible

    const vs = compile(gl, gl.VERTEX_SHADER, vertex)
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragment)
    const prog = gl.createProgram()
    if (!vs || !fs || !prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uPointer = gl.getUniformLocation(prog, 'uPointer')
    const uPointerAmt = gl.getUniformLocation(prog, 'uPointerAmt')
    const uTrailA = gl.getUniformLocation(prog, 'uTrailA')
    const uTrailB = gl.getUniformLocation(prog, 'uTrailB')
    const uAspect = gl.getUniformLocation(prog, 'uAspect')
    const uTrailGain = gl.getUniformLocation(prog, 'uTrailGain')
    const uCement = gl.getUniformLocation(prog, 'uCement')
    let cementMix = cementRef.current ? 1 : 0
    const trailA = new Float32Array(TRAIL_N * 4)
    const trailB = new Float32Array(TRAIL_N * 4)
    let trailGain = 0
    pointerTrail.start()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const resize = () => {
      const w = Math.max(32, Math.round(window.innerWidth * TUNING.resolution))
      const h = Math.max(32, Math.round(window.innerHeight * TUNING.resolution))
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    }
    resize()

    // A random starting point, so the field never opens on the same frame.
    const t0 = Math.random() * 1000
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, amt: 0, energy: 0 }
    let raf = 0
    let last = 0
    let lastTime = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000)
      lastTime = now
      const k = 1 - Math.exp(-TUNING.pointerDamping * dt)
      pointer.x += (pointer.tx - pointer.x) * k
      pointer.y += (pointer.ty - pointer.y) * k
      pointer.energy *= Math.exp(-0.9 * dt) // movement adds energy; stillness lets it settle
      pointer.amt += (Math.min(1, pointer.energy) * TUNING.pointerStrength - pointer.amt) * k
      gl.uniform1f(uTime, t0 + (reduced ? 0 : now / 1000) * TUNING.speed)
      gl.uniform2f(uPointer, pointer.x, pointer.y)
      // On the homepage the broad pointer warp gives way to the fluid trail.
      trailGain += ((fluidRef.current ? 1 : 0) - trailGain) * Math.min(1, dt * 4)
      gl.uniform1f(uPointerAmt, pointer.amt * (1 - trailGain))
      pointerTrail.update(now)
      pointerTrail.fill(trailA, trailB, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }, now)
      gl.uniform4fv(uTrailA, trailA)
      gl.uniform4fv(uTrailB, trailB)
      gl.uniform1f(uAspect, window.innerWidth / window.innerHeight)
      gl.uniform1f(uTrailGain, trailGain)
      cementMix += ((cementRef.current ? 1 : 0) - cementMix) * Math.min(1, dt * 2.5)
      gl.uniform1f(uCement, cementMix)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      // Full frame rate only while the surface is disturbed; slow drift needs far less.
      const busy = fluidRef.current && !pointerTrail.idle
      if (!busy && now - last < 1000 / TUNING.fps) return
      last = now
      draw(now)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (reduced) draw(performance.now())
      else raf = requestAnimationFrame(loop)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') cancelAnimationFrame(raf)
      else start()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const nx = e.clientX / window.innerWidth
      const ny = 1 - e.clientY / window.innerHeight
      pointer.energy += Math.hypot(nx - pointer.tx, ny - pointer.ty) * 6
      pointer.tx = nx
      pointer.ty = ny
    }
    const onResize = () => {
      resize()
      if (reduced) draw(performance.now())
    }
    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      canvas.dataset.lost = '' // CSS fallback shows through
    }

    start()
    canvas.dataset.ready = ''
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)
    canvas.addEventListener('webglcontextlost', onLost)
    if (fine && !reduced) window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      pointerTrail.stop()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('webglcontextlost', onLost)
      window.removeEventListener('pointermove', onMove)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <div className={styles.atmosphere} aria-hidden="true" data-cement={cement ? '' : undefined}>
      <canvas ref={canvasRef} className={styles.field} />
      <div className={styles.cement} />
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  )
}
