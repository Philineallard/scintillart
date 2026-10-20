/** Capability and preference detection for the portal. */

export type Quality = 'high' | 'low'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let webglCache: boolean | null = null

/** True if a WebGL context can actually be created (not just that the API exists). */
export function canUseWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    webglCache = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}

/** Touch devices, small screens and low-memory devices get smaller textures and fewer layers. */
export function detectQuality(): Quality {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 700 || window.innerWidth < 900
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return coarse || small || memory <= 3 ? 'low' : 'high'
}

export function hasFinePointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
