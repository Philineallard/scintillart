import { useEffect, useLayoutEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Atmosphere } from './components/Atmosphere'
import { ScintillaCursor } from './components/ScintillaCursor'
import { RefractionGlints } from './cursor/RefractionGlints'
import EntryPage from './pages/EntryPage'
import NotFound from './pages/NotFound'
import RetreatPage from './pages/RetreatPage'

/**
 * After an in-app navigation: start at the top of the new page and move focus to
 * its main heading (marked with data-route-heading), so keyboard and screen-reader
 * users land in the right place. The first load is left to the browser.
 */
function RouteFocus() {
  const location = useLocation()
  const first = useRef(true)

  useLayoutEffect(() => {
    if (!first.current) window.scrollTo(0, 0)
  }, [location.key])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const heading = document.querySelector<HTMLElement>('[data-route-heading]')
    heading?.focus({ preventScroll: true })
  }, [location.key])

  return null
}

export default function App() {
  const location = useLocation()
  return (
    <>
      <Atmosphere fluid={location.pathname === '/'} />
      <RouteFocus />
      {/* Homepage: custom cursor + fluid portal. Other pages: normal cursor + refraction glints.
          Keyed by route so each page's effect mounts fresh and cleans up when you leave. */}
      {location.pathname === '/' ? <ScintillaCursor key="home" /> : <RefractionGlints key={location.pathname} />}
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/retreats" element={<RetreatPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
