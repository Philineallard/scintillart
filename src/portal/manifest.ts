/** Types and loading for public/portal/manifest.json (written by scripts/prepare_portal_layers.py). */

export type Rect01 = { x: number; y: number; w: number; h: number }

export type PortalLayer = Rect01 & {
  id: string
  label: string
  /** Distance in front of the paper, in units of collage height. */
  depth: number
  /** Image basename in /portal (".webp" or "-sm.webp" is appended). */
  src: string
  /** Strength of the reflective highlight (0 = matte). */
  reflect: number
  shadow: Rect01 | null
}

export type PortalManifest = {
  width: number
  height: number
  /** The mirrored egg at the end of the corridor: where the camera travels to. */
  aperture: { cx: number; cy: number; rx: number; ry: number }
  /** Innermost pointed arch around the aperture: the shape the destination is revealed through. */
  arch: { x0: number; x1: number; top: number; bottom: number }
  layers: PortalLayer[]
}

export const PORTAL_BASE = '/portal'

/** Static geometry fallback, used if the manifest can't be fetched. Mirrors the generated manifest. */
export const DEFAULT_GEOMETRY: Pick<PortalManifest, 'width' | 'height' | 'aperture' | 'arch'> = {
  width: 1068,
  height: 1398,
  aperture: { cx: 538 / 1068, cy: 750 / 1398, rx: 44 / 1068, ry: 75 / 1398 },
  arch: { x0: 480 / 1068, x1: 598 / 1068, top: 640 / 1398, bottom: 838 / 1398 },
}

export const STATIC_ART = {
  src: `${PORTAL_BASE}/collage.webp`,
  srcSmall: `${PORTAL_BASE}/collage-sm.webp`,
  width: 1068,
  height: 1398,
}

let manifestPromise: Promise<PortalManifest> | null = null

export function loadManifest(): Promise<PortalManifest> {
  manifestPromise ??= fetch(`${PORTAL_BASE}/manifest.json`).then((r) => {
    if (!r.ok) throw new Error(`manifest ${r.status}`)
    return r.json() as Promise<PortalManifest>
  })
  manifestPromise.catch(() => {
    manifestPromise = null
  })
  return manifestPromise
}

export function layerUrl(layer: { src: string }, quality: 'high' | 'low'): string {
  return `${PORTAL_BASE}/${layer.src}${quality === 'low' ? '-sm' : ''}.webp`
}

export function shadowUrl(layer: { src: string }): string {
  return `${PORTAL_BASE}/${layer.src}-shadow.webp`
}
