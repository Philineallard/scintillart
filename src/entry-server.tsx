import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'

/**
 * Build-time render of one route to HTML (scripts/prerender.mjs), so crawlers and link
 * previews see the page's content without running JavaScript. The client hydrates it.
 */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
