import { useEffect, useRef } from 'react'
import styles from './Atmosphere.module.css'

/**
 * The page background (every page), built as layers, back to front:
 *
 *   1. Base colour       bone on <html> (tokens.css: --paper)
 *   2. Light field       this WebGL canvas: broad, domain-warped pools of light and
 *                        shadow drifting very slowly, plus cement mottling, in stone
 *                        tones taken from the collage (kraft, rose-clay, faint sage)
 *   3. Cement texture    a static tile of soft patches and tiny pores (CSS)
 *   4. Film grain        fine grain that flickers gently, like film (CSS)
 *   5. Vignette          a faint darkening toward the edges (CSS)
 *
 * The pointer has no effect on the background. Without WebGL, a static CSS version
 * shows instead; with reduced motion, the field and grain hold still.
 */

const TUNING = {
  /** Render scale of the light field relative to CSS pixels (low = softer, cheaper). */
  resolution: 0.22,
  /** Frames per second for the drift; the motion is slow enough that this is invisible. */
  fps: 24,
  /** Drift speed of the light field. */
  speed: 0.018,
}

const vertex = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const fragment = /* glsl */ `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;

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
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 0.85; // broad pools, no fine detail
  float t = uTime;

  // Domain warping: light moving slowly through a translucent material.
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + 1.6 * q + vec2(1.7, 9.2) + t * 0.45),
                fbm(p + 1.6 * q + vec2(8.3, 2.8) - t * 0.35));
  float f = fbm(p + 1.5 * r);

  // Bone: creamy, slightly yellowed off-white with warm grey shadow, faint rose and sage.
  vec3 stone = vec3(0.886, 0.847, 0.780);
  vec3 base  = vec3(0.965, 0.933, 0.875);
  vec3 light = vec3(0.984, 0.965, 0.925);
  vec3 rose  = vec3(0.937, 0.871, 0.816);
  vec3 sage  = vec3(0.898, 0.890, 0.831);

  vec3 col = mix(stone, base, smoothstep(0.22, 0.72, f));
  col = mix(col, rose, smoothstep(0.45, 0.85, r.x) * 0.45);
  col = mix(col, light, smoothstep(0.6, 0.95, f) * 0.55);

  // Cement: mid-scale mottling and a faint sage cast in places.
  float m = fbm(p * 3.6 + vec2(3.1, 7.7) + q * 0.35);
  col *= 1.0 + (m - 0.5) * 0.09;
  col = mix(col, sage, smoothstep(0.55, 0.85, q.y) * 0.18);

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

export function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
    let raf = 0
    let last = 0

    const draw = (now: number) => {
      gl.uniform1f(uTime, t0 + (reduced ? 0 : now / 1000) * TUNING.speed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 1000 / TUNING.fps) return
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

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.field} />
      <div className={styles.cement} />
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  )
}
