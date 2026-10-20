import { lazy, type MouseEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHref, useNavigate } from 'react-router'
import { ActionLink } from '../components/ActionLink'
import { BrandDefinition } from '../components/BrandDefinition'
import { ScintillartWordmark } from '../components/ScintillartWordmark'
import { brand } from '../content/brand'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { canUseWebGL, detectQuality, hasFinePointer, prefersReducedMotion } from '../portal/capabilities'
import { DEFAULT_GEOMETRY, loadManifest, type PortalManifest, STATIC_ART } from '../portal/manifest'
import { PortalErrorBoundary } from '../portal/PortalErrorBoundary'
import { PortalTransition } from '../portal/PortalTransition'
import { type PortalMode, usePortalMachine } from '../portal/usePortalMachine'
import { loadCriticalFonts } from '../styles/fonts'
import styles from './EntryPage.module.css'

// three.js + React Three Fiber only load on the entry page, in their own chunk.
const PortalScene = lazy(() => import('../portal/PortalScene'))

export default function EntryPage() {
  useDocumentTitle('Scintillart. Where a spark becomes art.')
  const navigate = useNavigate()
  const retreatsHref = useHref('/retreats')
  const reducedMotion = useMemo(prefersReducedMotion, [])
  const quality = useMemo(detectQuality, [])
  const pointerParallax = useMemo(() => !reducedMotion && hasFinePointer(), [reducedMotion])

  // Reduced motion uses the still image: no depth animation is needed.
  const [mode, setMode] = useState<PortalMode>(() => (reducedMotion ? 'static' : 'pending'))
  const [manifest, setManifest] = useState<PortalManifest | null>(null)

  const wordmarkRef = useRef<HTMLSpanElement>(null)
  const definitionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLElement>(null)
  const staticArtRef = useRef<HTMLImageElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)

  const machine = usePortalMachine({
    refs: {
      wordmark: wordmarkRef,
      copy: [definitionRef, ctaRef],
      slot: slotRef,
      staticArt: staticArtRef,
      destination: destinationRef,
    },
    mode,
    reducedMotion,
    geometry: manifest ?? DEFAULT_GEOMETRY,
    onEntered: () => navigate('/retreats', { state: { viaPortal: true } }),
  })
  const { fontsReady, artReady, artFailed, showStaticArtNow } = machine

  // Fonts first (briefly), so the wordmark never reflows mid-reveal.
  useEffect(() => {
    loadCriticalFonts().then(fontsReady)
  }, [fontsReady])

  // Decide how to render the artwork.
  useEffect(() => {
    let cancelled = false
    loadManifest()
      .then((m) => {
        if (cancelled) return
        setManifest(m)
        setMode((current) => (current === 'pending' ? (canUseWebGL() ? 'webgl' : 'static') : current))
      })
      .catch(() => {
        if (!cancelled) setMode('static')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const artShownRef = useRef(false)

  // The <img> only exists in static mode (reduced motion, no WebGL, or after a WebGL failure).
  const onImgLoad = () => {
    if (artShownRef.current) showStaticArtNow()
    else {
      artShownRef.current = true
      artReady()
    }
  }
  const onImgError = () => {
    if (!artShownRef.current) artFailed()
  }
  const onSceneReady = useCallback(() => {
    artShownRef.current = true
    artReady()
  }, [artReady])
  const onSceneError = useCallback(() => setMode('static'), [])

  const onCta = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle new-tab / modified clicks normally.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    machine.enter()
  }

  const busy = machine.phase === 'entering' || machine.phase === 'entered'
  const showSkip = !reducedMotion && (machine.phase === 'revealing' || machine.phase === 'entering')

  return (
    <main className={styles.entry} data-phase={machine.phase} data-mode={mode}>
      {mode === 'webgl' && manifest && (
        <PortalErrorBoundary onError={onSceneError}>
          <Suspense fallback={null}>
            <PortalScene
              manifest={manifest}
              quality={quality}
              controller={machine.controller}
              slotRef={slotRef}
              pointerParallax={pointerParallax}
              onReady={onSceneReady}
              onError={onSceneError}
            />
          </Suspense>
        </PortalErrorBoundary>
      )}

      <header className={styles.header}>
        <ScintillartWordmark ref={wordmarkRef} />
      </header>

      <div className={styles.stage}>
        <figure ref={slotRef} className={styles.portalSlot} role="img" aria-label={brand.artworkAlt}>
          {mode === 'static' && (
            <img
              ref={staticArtRef}
              className={styles.staticArt}
              src={STATIC_ART.src}
              srcSet={`${STATIC_ART.srcSmall} 534w, ${STATIC_ART.src} 1068w`}
              sizes="(min-width: 1200px) 44vw, 92vw"
              width={STATIC_ART.width}
              height={STATIC_ART.height}
              alt=""
              decoding="async"
              fetchPriority="high"
              style={reducedMotion ? undefined : { opacity: 0 }}
              onLoad={onImgLoad}
              onError={onImgError}
            />
          )}
        </figure>

        <BrandDefinition ref={definitionRef} className={styles.definition} />

        <div ref={ctaRef} className={styles.ctaBlock}>
          <p className={styles.line}>{brand.line}</p>
          <ActionLink href={retreatsHref} onClick={onCta} aria-disabled={busy || undefined} className={styles.cta}>
            {brand.primaryAction}
          </ActionLink>
        </div>
      </div>

      {showSkip && (
        <button type="button" className={styles.skip} onClick={machine.skip}>
          Skip animation
        </button>
      )}

      {/* The destination is mounted from the start, hidden and inert, so it's ready before the transition. */}
      <PortalTransition ref={destinationRef} />
    </main>
  )
}
