/**
 * Pointer trail for the fluid-like distortion (homepage).
 *
 * A smoothed follower chases the mouse (the slight delay), and every few pixels it
 * drops a "disturbance" carrying its position, direction and strength (faster = a
 * little stronger). Each disturbance spreads out and fades over LIFE seconds. Both
 * WebGL scenes (background light field and portal) read the same trail and evaluate
 * the same displacement function (FLUID_GLSL), so they ripple together.
 *
 * This is an analytic approximation of a disturbed liquid surface, not a full
 * Navier–Stokes simulation: cheap, stable, and easy to tune.
 */

export const TRAIL_N = 24

export const FLUID = {
  /** Seconds a disturbance lives before it has fully settled. */
  life: 1.8,
  /** Distance (px) the follower travels between disturbances. */
  spacing: 14,
  /** Follower responsiveness (per second). Lower = lazier, more liquid. */
  follow: 10,
  /** Speed (px/s) that gives full strength. */
  fullSpeed: 1600,
  minStrength: 0.18,
}

type Point = { x: number; y: number; dx: number; dy: number; s: number; t: number }

class PointerTrail {
  private points: Point[] = []
  private target = { x: 0, y: 0 }
  private follower = { x: 0, y: 0 }
  private travel = 0
  private hasPointer = false
  private last = 0
  private users = 0
  private enabled = false

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    if (!this.hasPointer) {
      this.follower = { x: e.clientX, y: e.clientY }
      this.hasPointer = true
    }
    this.target = { x: e.clientX, y: e.clientY }
  }

  private onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    // A click is a small splash: a ring of disturbances pushing outward.
    const now = performance.now() / 1000
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      this.push({ x: e.clientX, y: e.clientY, dx: Math.cos(a), dy: Math.sin(a), s: 0.55, t: now })
    }
  }

  /** Consumers call start() on mount and stop() on unmount (reference counted). */
  start() {
    this.users++
    if (this.users > 1) return
    this.enabled =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!this.enabled) return
    window.addEventListener('pointermove', this.onMove, { passive: true })
    window.addEventListener('pointerdown', this.onDown, { passive: true })
  }

  stop() {
    this.users = Math.max(0, this.users - 1)
    if (this.users > 0) return
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerdown', this.onDown)
    this.points = []
    this.hasPointer = false
  }

  private push(p: Point) {
    this.points.push(p)
    if (this.points.length > TRAIL_N) this.points.shift()
  }

  /** Advance the follower. Safe to call from several render loops per frame. */
  update(nowMs: number) {
    const now = nowMs / 1000
    const dt = Math.min(0.05, now - this.last)
    if (dt < 0.004) return
    this.last = now
    this.points = this.points.filter((p) => now - p.t < FLUID.life)
    if (!this.hasPointer) return
    const k = 1 - Math.exp(-FLUID.follow * dt)
    const mx = (this.target.x - this.follower.x) * k
    const my = (this.target.y - this.follower.y) * k
    this.follower.x += mx
    this.follower.y += my
    const step = Math.hypot(mx, my)
    if (step < 0.01) return
    this.travel += step
    if (this.travel >= FLUID.spacing) {
      this.travel = 0
      const speed = step / dt
      const s = Math.min(1, Math.max(FLUID.minStrength, speed / FLUID.fullSpeed))
      this.push({ x: this.follower.x, y: this.follower.y, dx: mx / step, dy: my / step, s, t: now })
    }
  }

  get idle() {
    return this.points.length === 0
  }

  /**
   * Write the trail into uniform arrays, in coordinates relative to a canvas rect
   * (0..1, y up). a = [x, y, dirX, dirY], b = [age, strength, 0, 0].
   */
  fill(a: Float32Array, b: Float32Array, rect: { left: number; top: number; width: number; height: number }, nowMs: number) {
    const now = nowMs / 1000
    for (let i = 0; i < TRAIL_N; i++) {
      const p = this.points[i]
      if (!p) {
        b[i * 4 + 1] = 0
        continue
      }
      a[i * 4] = (p.x - rect.left) / rect.width
      a[i * 4 + 1] = 1 - (p.y - rect.top) / rect.height
      a[i * 4 + 2] = p.dx
      a[i * 4 + 3] = -p.dy
      b[i * 4] = now - p.t
      b[i * 4 + 1] = p.s
    }
  }
}

export const pointerTrail = new PointerTrail()

/**
 * GLSL: displacement (in uv units) of a soft liquid surface disturbed by the trail.
 * Each disturbance is an elongated gaussian (stretched along its direction) that eases
 * in, widens (diffuses) and fades with age, with a slight curl to either side.
 * Needs: uniform vec4 uTrailA[TRAIL_N], uTrailB[TRAIL_N]; uniform float uAspect, uTrailGain.
 */
export const FLUID_GLSL = /* glsl */ `
#define TRAIL_N ${TRAIL_N}
uniform vec4 uTrailA[TRAIL_N];
uniform vec4 uTrailB[TRAIL_N];
uniform float uAspect;
uniform float uTrailGain;

vec2 fluidDisplace(vec2 uv) {
  vec2 disp = vec2(0.0);
  if (uTrailGain <= 0.0) return disp;
  for (int i = 0; i < TRAIL_N; i++) {
    vec4 a = uTrailA[i];
    vec4 b = uTrailB[i];
    if (b.y <= 0.0) continue;
    float age = b.x;
    vec2 d = (uv - a.xy) * vec2(uAspect, 1.0);
    vec2 dir = a.zw;
    vec2 nrm = vec2(-dir.y, dir.x);
    float along = dot(d, dir);
    float across = dot(d, nrm);
    float r = 0.03 + age * 0.055;                       // spreads as it settles
    float g = exp(-(along * along) / (r * r * 3.5) - (across * across) / (r * r));
    float life = smoothstep(0.0, 0.12, age) * exp(-age * 2.3); // eases in, then dissipates
    float k = b.y * g * life;
    disp += dir * k * 0.022 + nrm * sign(across) * k * 0.006;
  }
  return disp * uTrailGain / vec2(uAspect, 1.0);
}
`
