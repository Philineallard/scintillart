import { useEffect, useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Atmosphere } from './components/Atmosphere'
import { ScintillaCursor } from './components/ScintillaCursor'
import ArrivalPage from './pages/ArrivalPage'
import EntryPage from './pages/EntryPage'
import NotFound from './pages/NotFound'
import PrivacyPage from './pages/PrivacyPage'
import TheSparkPage from './pages/TheSparkPage'
import VenuePage from './pages/VenuePage'

/**
 * Pages on Brand Guidelines v2.0: no custom cursor. In the light theme they share the
 * homepage's cinematic white background; in the dark theme brand.css hides it.
 */
const BRAND_V2 = ['/thespark', '/privacy']

/**
 * After an in-app navigation: start at the top of the new page and move focus to
 * its main heading (marked with data-route-heading), so keyboard and screen-reader
 * users land in the right place. The first load is left to the browser.
 */
function RouteFocus() {
  const location = useLocation()
  const first = useRef(true)

  useLayoutEffect(() => {
    if (!first.current && !location.hash) window.scrollTo(0, 0)
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
        {/* Old addresses. On Cloudflare Pages, public/_redirects answers these with a 301 first. */}
        <Route path="/retreats" element={<Navigate to="/thespark" replace />} />
        <Route path="/venue" element={<Navigate to="/thespark#venue" replace />} />
        {/* The fuller venue presentation; kept out of search until it carries content of its own. */}
        <Route path="/thespark-venue" element={<VenuePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/arrival-in-lisbon" element={<ArrivalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
