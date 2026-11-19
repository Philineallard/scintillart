import { useEffect, useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Atmosphere } from './components/Atmosphere'
import { ScintillaCursor } from './components/ScintillaCursor'
import ArrivalPage from './pages/ArrivalPage'
import ArtistsPage from './pages/ArtistsPage'
import EntryPage from './pages/EntryPage'
import NotFound from './pages/NotFound'
import PrivacyPage from './pages/PrivacyPage'
import { terms } from './content/terms'
import TheSparkPage from './pages/TheSparkPage'
import VenuePage from './pages/VenuePage'

/**
 * Pages on Brand Guidelines v2.0: no custom cursor. In the light theme they share the
 * homepage's cinematic white background; in the dark theme brand.css hides it.
 */
const BRAND_V2 = ['/thespark', '/thespark-artists', '/privacy', '/booking-terms']

/**
 * After an in-app navigation: start at the top of the new page and move focus to
 * its main heading (marked with data-route-heading), so keyboard and screen-reader
 * users land in the right place. The first load is left to the browser.
 */
function RouteFocus() {
  const location = useLocation()
  const first = useRef(true)

  // Start at the top, unless the new address points at an element on the new page
  // (e.g. /thespark#venue). #register opens a panel and has no element, so the page starts at the top too.
  useLayoutEffect(() => {
    if (first.current) return
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (!target) window.scrollTo(0, 0)
  }, [location.key, location.hash])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (location.hash) return
    const heading = document.querySelector<HTMLElement>('[data-route-heading]')
    heading?.focus({ preventScroll: true })
  }, [location.key, location.hash])

  return null
}

export default function App() {
  const location = useLocation()
  const v2 = BRAND_V2.includes(location.pathname)
  return (
    <>
      <Atmosphere white={location.pathname === '/' || v2} />
      <RouteFocus />
      {!v2 && <ScintillaCursor />}
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/thespark" element={<TheSparkPage />} />
        <Route path="/thespark-artists" element={<ArtistsPage />} />
        {/* Old addresses. On Cloudflare Pages, public/_redirects answers these with a 301 first. */}
        <Route path="/retreats" element={<Navigate to="/thespark" replace />} />
        <Route path="/venue" element={<Navigate to="/thespark#venue" replace />} />
        {/* The fuller venue presentation; kept out of search until it carries content of its own. */}
        <Route path="/thespark-venue" element={<VenuePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/booking-terms" element={<PrivacyPage doc={terms} />} />
        <Route path="/arrival-in-lisbon" element={<ArrivalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
