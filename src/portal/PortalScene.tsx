/**
 * PortalScene: the WebGL depth version of the collage (lazy-loaded chunk).
 *
 * How the depth illusion stays honest with one flattened photograph:
 * every fragment is a masked crop of the same rectified image. Each fragment sits
 * at its own depth, and its position and scale are compensated by (D - z) / D so
 * that, from the resting camera, all fragments line up pixel-for-pixel with the
 * paper beneath. Depth only becomes visible when the stack tilts slightly with the
 * pointer, or when the camera travels through the doorway.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import {
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  type ShaderMaterial,
  type Texture,
  TextureLoader,
  Vector3,
  Vector4,
} from 'three'
import type { Quality } from './capabilities'
import type { PortalController } from './controller'
import { createLayerMaterial, type LayerUniforms } from './layerMaterial'
import { layerUrl, type PortalLayer, type PortalManifest, shadowUrl } from './manifest'
import styles from './PortalScene.module.css'
import { TIMING, VISUAL } from './timing'

type LoadedLayer = { layer: PortalLayer; map: Texture; shadow: Texture | null }

export type PortalSceneProps = {
  manifest: PortalManifest
  quality: Quality
  controller: PortalController
  /** The DOM element the collage occupies; the scene aligns itself to it. */
  slotRef: RefObject<HTMLElement | null>
  /** Pointer tilt and highlight are only enabled for a fine, hovering pointer. */
  pointerParallax: boolean
  onReady: () => void
  onError: (error: unknown) => void
}

export default function PortalScene(props: PortalSceneProps) {
  const { manifest, quality, onError } = props
  const wrapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState<LoadedLayer[] | null>(null)
  const [running, setRunning] = useState(true)

  // All fragments are always drawn: each one's area is a recess in the layer below it.
  const layers = manifest.layers

  // Load textures before mounting the canvas. A failure or timeout falls back to the static image.
  useEffect(() => {
    let done = false
    const textures: Texture[] = []
    const loader = new TextureLoader()
    const load = async (url: string) => {
      const t = await loader.loadAsync(url)
      textures.push(t)
      t.anisotropy = 4
      return t
    }
    const timer = window.setTimeout(() => {
      if (done) return
      done = true
      onError(new Error('portal textures timed out'))
    }, TIMING.assetTimeoutMs)

    Promise.all(
      layers.map(async (layer) => ({
        layer,
        map: await load(layerUrl(layer, quality)),
        shadow: quality === 'high' && layer.shadow ? await load(shadowUrl(layer)) : null,
      })),
    )
      .then((list) => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        setLoaded(list)
      })
      .catch((err) => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        onError(err)
      })

    return () => {
      done = true
      window.clearTimeout(timer)
      textures.forEach((t) => t.dispose())
    }
  }, [layers, quality, onError])

  // Pause rendering when the tab is hidden or the portal has scrolled out of view.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let inView = true
    const update = () => setRunning(inView && document.visibilityState === 'visible')
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return (
    <div ref={wrapRef} className={styles.canvasWrap} aria-hidden="true">
      {loaded && (
        <Canvas
          frameloop={running ? 'always' : 'never'}
          dpr={[1, VISUAL.dpr[quality]]}
          flat
          linear
          gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
          camera={{ fov: VISUAL.fov, near: 0.01, far: 100, position: [0, 0, VISUAL.cameraDistance] }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.domElement.addEventListener(
              'webglcontextlost',
              (e) => {
                e.preventDefault()
                onError(new Error('WebGL context lost'))
              },
              { once: true },
            )
            // Upload textures now, so the reveal doesn't stutter on its first frames.
            loaded.forEach(({ map, shadow }) => {
              gl.initTexture(map)
              if (shadow) gl.initTexture(shadow)
            })
          }}
        >
          <PortalLayers {...props} loaded={loaded} wrapRef={wrapRef} />
        </Canvas>
      )}
    </div>
  )
}

type LayersProps = PortalSceneProps & {
  loaded: LoadedLayer[]
  wrapRef: RefObject<HTMLDivElement | null>
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

function PortalLayers({ loaded, manifest, controller, slotRef, wrapRef, pointerParallax, onReady }: LayersProps) {
  const invalidate = useThree((s) => s.invalidate)
  const groupRef = useRef<Group>(null)
  const meshRefs = useRef<(Mesh | null)[]>([])
  const shadowRefs = useRef<(Mesh | null)[]>([])
  const layout = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null)
  const smooth = useRef({ tx: 0, ty: 0, u: 0.5, v: 0.45, light: 0 })
  const readySent = useRef(false)
  const lastFade = useRef(-1)
  const scratch = useMemo(() => ({ a: new Vector3(), b: new Vector3() }), [])

  const geometry = useMemo(() => new PlaneGeometry(1, 1), [])
  const items = useMemo(
    () =>
      loaded.map((entry) => ({
        ...entry,
        material: createLayerMaterial(
          entry.map,
          new Vector4(entry.layer.x, entry.layer.y, entry.layer.w, entry.layer.h),
          entry.layer.reflect,
        ),
        shadowMaterial: entry.shadow
          ? new MeshBasicMaterial({ map: entry.shadow, transparent: true, depthWrite: false, depthTest: false, opacity: 0 })
          : null,
      })),
    [loaded],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      items.forEach((it) => {
        it.material.dispose()
        it.shadowMaterial?.dispose()
      })
    },
    [geometry, items],
  )

  // Where the collage sits relative to the canvas. Both scroll together, so this
  // only changes with layout (resize, fonts), never per frame.
  useEffect(() => {
    const measure = () => {
      const s = slotRef.current?.getBoundingClientRect()
      const c = wrapRef.current?.getBoundingClientRect()
      if (!s || !c) return
      layout.current = { sx: s.left - c.left, sy: s.top - c.top, sw: s.width, sh: s.height }
      invalidate()
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (slotRef.current) ro.observe(slotRef.current)
    if (wrapRef.current) ro.observe(wrapRef.current)
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => undefined)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [slotRef, wrapRef, invalidate])

  // Pointer: one listener, writes plain numbers. Damping happens in the frame loop.
  useEffect(() => {
    if (!pointerParallax) return
    const p = controller.pointer
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      p.x = MathUtils.clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1)
      p.y = MathUtils.clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1)
      const r = slotRef.current?.getBoundingClientRect()
      if (r && r.width > 0) {
        p.u = (e.clientX - r.left) / r.width
        p.v = (e.clientY - r.top) / r.height
      }
      p.active = true
    }
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) p.active = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
      p.active = false
    }
  }, [pointerParallax, controller, slotRef])

  useFrame((state, delta) => {
    const L = layout.current
    const group = groupRef.current
    if (!L || !group || L.sh < 1) return

    const dt = Math.min(delta, 1 / 20)
    const { width: cw, height: ch } = state.size
    const c = controller
    const D = VISUAL.cameraDistance

    // Pixel → world mapping on the paper plane (z = 0) for the resting camera.
    const k = (2 * D * Math.tan(MathUtils.degToRad(VISUAL.fov / 2))) / ch
    const S = L.sh * k // collage height in world units
    const Wc = L.sw * k
    const X0 = (L.sx - cw / 2) * k
    const Y0 = -(L.sy - ch / 2) * k
    const Cx = X0 + Wc / 2
    const Cy = Y0 - S / 2

    const { reveal, open, enter } = c
    // Depth separation: flat while fading in, then the paper layers part.
    const sep = smoothstep(0.2, 1, reveal) * (1 + open * VISUAL.openSeparation)
    const calm = 1 - Math.min(1, open * 1.5) // idle motion fades out as the portal opens

    // Damped pointer response (tilt + highlight position).
    const sm = smooth.current
    const damp = 1 - Math.exp(-VISUAL.tiltDamping * dt)
    const active = c.pointer.active && pointerParallax ? 1 : 0
    sm.tx += (c.pointer.y * active * calm - sm.tx) * damp
    sm.ty += (c.pointer.x * active * calm - sm.ty) * damp
    sm.u += (c.pointer.u - sm.u) * damp
    sm.v += (c.pointer.v - sm.v) * damp
    sm.light += (active * calm - sm.light) * damp

    const fade = smoothstep(0, 0.32, reveal)
    if (fade !== lastFade.current) {
      lastFade.current = fade
      state.gl.domElement.style.opacity = String(fade)
    }

    const maxTilt = MathUtils.degToRad(VISUAL.maxTiltDeg)
    group.position.set(Cx, Cy, 0)
    group.rotation.set(sm.tx * maxTilt, sm.ty * maxTilt, 0)

    const t = state.clock.elapsedTime
    const breatheW = (2 * Math.PI) / VISUAL.breathe.periodS
    let door: { mesh: Mesh; layer: PortalLayer; z: number; f: number } | null = null

    items.forEach((it, i) => {
      const l = it.layer
      const mesh = meshRefs.current[i]
      if (!mesh) return
      const z = l.depth * S * sep
      const f = (D - z) / D // perspective compensation: keeps the fragment aligned from the resting camera
      const breathe = (VISUAL.breathe.amplitude[l.id] ?? 0) * Math.sin(t * breatheW + i * 1.7) * reveal * calm
      const lift = ((VISUAL.openLift[l.id] ?? 0) * open + breathe) * S
      // Pointer parallax: nearer fragments drift further with the pointer than deeper ones.
      const depthK = l.depth / 0.2
      const shiftX = sm.ty * depthK * VISUAL.parallaxShift * S
      const shiftY = -sm.tx * depthK * VISUAL.parallaxShift * S
      const px = X0 + (l.x + l.w / 2) * Wc + shiftX
      const py = Y0 - (l.y + l.h / 2) * S + lift + shiftY
      mesh.position.set(px * f - Cx, py * f - Cy, z)
      mesh.scale.set(l.w * Wc * f, l.h * S * f, 1)
      mesh.renderOrder = i * 2 + 1

      const u = it.material.uniforms as unknown as LayerUniforms
      // Fragments are opaque; the fade-in happens on the whole canvas (below), because lower
      // layers contain recesses that must never show through a half-transparent upper layer.
      const opacity = 1
      u.uOpacity.value = opacity
      u.uBright.value =
        l.id === 'doorway' ? 0.74 + 0.26 * smoothstep(0.35, 0.9, reveal) : 0.88 + 0.12 * smoothstep(0.1, 0.6, reveal)
      u.uSweep.value = c.sweep
      u.uLight.value.set(sm.u, sm.v)
      u.uLightAmt.value = sm.light

      const shadow = shadowRefs.current[i]
      if (shadow && l.shadow && it.shadowMaterial) {
        // Soft contact shadow just behind the fragment, falling down-right; grows with depth.
        const shadowK = depthK * sep
        const zS = z * 0.94
        const fS = (D - zS) / D
        const sx = X0 + (l.shadow.x + l.shadow.w / 2) * Wc + shiftX + 0.01 * S * shadowK
        const sy = Y0 - (l.shadow.y + l.shadow.h / 2) * S + lift + shiftY - 0.014 * S * shadowK
        shadow.position.set(sx * fS - Cx, sy * fS - Cy, zS)
        shadow.scale.set(l.shadow.w * Wc * fS, l.shadow.h * S * fS, 1)
        shadow.renderOrder = i * 2
        it.shadowMaterial.opacity = VISUAL.shadowOpacity * Math.min(1, sep) * opacity
      }
      if (l.id === 'doorway') door = { mesh, layer: l, z, f }
    })

    // Camera: travels toward the mirrored aperture at the end of the corridor and
    // stops just in front of the doorway plane, by which point the arch fills the view.
    const cam = state.camera
    const d = door as { mesh: Mesh; layer: PortalLayer; z: number; f: number } | null
    if (d && enter > 0) {
      const a = manifest.aperture
      const ax = (X0 + a.cx * Wc) * d.f
      const ay = (Y0 - a.cy * S) * d.f
      // Distance to the doorway shrinks geometrically, not linearly: apparent size grows
      // as 1 / distance, so this keeps the approach feeling like an even, continuous zoom.
      const d0 = D - d.z
      const d1 = VISUAL.apertureStop * S
      const dist = d0 * Math.pow(d1 / d0, enter)
      const travelled = (d0 - dist) / (d0 - d1)
      cam.position.set(ax * travelled, ay * travelled, d.z + dist)
    } else {
      cam.position.set(0, 0, D)
    }
    cam.updateMatrixWorld()

    // Report the on-screen doorway arch so the DOM destination can be revealed through it.
    if (c.onArch && d && (enter > 0 || open > 0)) {
      const wrap = wrapRef.current?.getBoundingClientRect()
      if (wrap) {
        const l = d.layer
        const arch = manifest.arch
        d.mesh.updateWorldMatrix(true, false)
        const lx = (x: number) => (x - (l.x + l.w / 2)) / l.w
        const ly = (y: number) => -(y - (l.y + l.h / 2)) / l.h
        const p0 = scratch.a.set(lx(arch.x0), ly(arch.top), 0).applyMatrix4(d.mesh.matrixWorld).project(cam)
        const p1 = scratch.b.set(lx(arch.x1), ly(arch.bottom), 0).applyMatrix4(d.mesh.matrixWorld).project(cam)
        const toX = (n: number) => wrap.left + ((n + 1) / 2) * cw
        const toY = (n: number) => wrap.top + ((1 - n) / 2) * ch
        const left = toX(p0.x)
        const top = toY(p0.y)
        c.onArch({ left, top, width: toX(p1.x) - left, height: toY(p1.y) - top })
      }
    }

    if (!readySent.current) {
      readySent.current = true
      requestAnimationFrame(() => onReady())
    }
  })

  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <group key={it.layer.id}>
          {it.shadowMaterial && (
            <mesh
              ref={(m) => {
                shadowRefs.current[i] = m
              }}
              geometry={geometry}
              material={it.shadowMaterial}
              frustumCulled={false}
            />
          )}
          <mesh
            ref={(m) => {
              meshRefs.current[i] = m
            }}
            geometry={geometry}
            material={it.material as ShaderMaterial}
            frustumCulled={false}
          />
        </group>
      ))}
    </group>
  )
}
