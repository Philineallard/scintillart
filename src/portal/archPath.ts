import type { ArchRect } from './controller'

/**
 * Pointed (ogival) arch matching the vaults of the doorway in the collage.
 * Coordinates are viewport pixels: the destination layer is position: fixed; inset: 0.
 */
export function archPathData({ left: x, top: y, width: w, height: h }: ArchRect): string {
  const cx = x + w / 2
  const spring = y + h * 0.42 // where the straight jambs turn into the arch
  const r = (n: number) => n.toFixed(1)
  return [
    `M${r(x)},${r(y + h)}`,
    `L${r(x)},${r(spring)}`,
    `C${r(x)},${r(y + h * 0.17)} ${r(cx - w * 0.22)},${r(y + h * 0.04)} ${r(cx)},${r(y)}`,
    `C${r(cx + w * 0.22)},${r(y + h * 0.04)} ${r(x + w)},${r(y + h * 0.17)} ${r(x + w)},${r(spring)}`,
    `L${r(x + w)},${r(y + h)}`,
    'Z',
  ].join(' ')
}

let pathSupported: boolean | null = null
function supportsPathClip(): boolean {
  pathSupported ??= typeof CSS !== 'undefined' && CSS.supports('clip-path', "path('M0,0 L1,0 L1,1 Z')")
  return pathSupported
}

/** Clip an element to the arch. Falls back to an ellipse where path() isn't supported. */
export function applyArchClip(el: HTMLElement, rect: ArchRect | null): void {
  if (!rect) {
    el.style.clipPath = 'none'
    return
  }
  if (supportsPathClip()) {
    el.style.clipPath = `path('${archPathData(rect)}')`
  } else {
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    el.style.clipPath = `ellipse(${rect.width / 2}px ${rect.height / 2}px at ${cx}px ${cy}px)`
  }
}

/** True once the arch fully covers the viewport, so the clip can be dropped. */
export function archCoversViewport(rect: ArchRect): boolean {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const spring = rect.top + rect.height * 0.42
  return rect.left <= 0 && rect.left + rect.width >= vw && spring <= 0 && rect.top + rect.height >= vh
}
