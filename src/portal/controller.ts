/**
 * The mutable bridge between GSAP timelines (which tween these numbers) and the
 * render loop / DOM writers (which read them every frame). Deliberately NOT React
 * state: nothing here causes a re-render.
 */
export type ArchRect = { left: number; top: number; width: number; height: number }

export type PortalController = {
  /** 0 → 1: entrance reveal (layers fade in, then separate in depth). */
  reveal: number
  /** Position of the single light sweep across reflective layers (-0.5 → 1.5). */
  sweep: number
  /** 0 → 1: the portal opens (layers spread apart). */
  open: number
  /** 0 → 1: camera travel through the doorway. */
  enter: number
  /** Pointer target in [-1, 1], plus its position in collage UV for highlights. */
  pointer: { x: number; y: number; u: number; v: number; active: boolean }
  /** Called with the on-screen rectangle of the doorway arch while the portal is entering. */
  onArch: ((rect: ArchRect) => void) | null
}

export function createController(): PortalController {
  return {
    reveal: 0,
    sweep: -0.5,
    open: 0,
    enter: 0,
    pointer: { x: 0, y: 0, u: 0.5, v: 0.45, active: false },
    onArch: null,
  }
}
