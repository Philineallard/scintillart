/**
 * Every tunable timing and visual control for the portal, in one place.
 * Durations are in seconds (GSAP), unless the name ends in Ms.
 */
export const TIMING = {
  /** If the artwork isn't ready after this, show the text anyway and reveal the art when it arrives. */
  patienceMs: 1200,
  /** Give up waiting for WebGL textures and use the static image. */
  assetTimeoutMs: 8000,

  reveal: {
    wordmark: 1.15,
    layersAt: 0.15,
    layers: 1.6, // paper layers separate in depth
    sweepAt: 0.95,
    sweep: 1.1, // the single light sweep across the reflective material
    copyAt: 1.15,
    copy: 0.8,
    copyStagger: 0.12,
  }, // total ≈ 2.1s

  enter: {
    copyOut: 0.35,
    wordmarkOut: 0.7,
    open: 0.95, // roof lifts, base drops, layers spread
    travelAt: 0.12,
    travel: 1.45, // camera accelerates toward and through the doorway
    destinationAt: 0.42, // destination starts to appear inside the doorway arch
    destination: 0.55,
  }, // total ≈ 1.6s

  reducedMotionDissolve: 0.3,
} as const

export const VISUAL = {
  fov: 30,
  cameraDistance: 10,
  /** Max stack tilt from the pointer (degrees). Small: the cut-outs share one photograph. */
  maxTiltDeg: 4,
  /** Pointer parallax: deepest fragment shifts by this fraction of collage height at full pointer travel. */
  parallaxShift: 0.014,
  /** Exponential damping rate for pointer response (per second). Lower = lazier. */
  tiltDamping: 3.2,
  /** Idle breathing: only these layers move, by a fraction of the collage height. */
  breathe: { periodS: 7.5, amplitude: { crystal: 0.0035, owl: 0.0025 } as Record<string, number> },
  /** Extra depth separation while the portal opens (multiplier added to 1). */
  openSeparation: 0.6,
  /** Vertical drift while opening, as a fraction of collage height (+ up). */
  openLift: { roof: 0.045, owl: 0.05, crystal: -0.055, coils: -0.045 } as Record<string, number>,
  /** Where the camera stops in front of the doorway, as a fraction of collage height. */
  apertureStop: 0.05,
  shadowOpacity: 0.3,
  /** Low quality (touch, small or low-memory devices): half-size textures, no shadows, no MSAA, lower DPR. */
  dpr: { high: 2, low: 1.5 },
} as const
