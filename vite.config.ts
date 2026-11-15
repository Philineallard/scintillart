import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const SITE = 'https://scintillart.com'

/**
 * The <head> for each page. Crawlers and link previews (WhatsApp, LinkedIn, Facebook)
 * read this before any JavaScript runs, so every route gets its own title,
 * description and canonical URL. Keep in step with the useDocumentTitle() calls.
 * Pages listed as indexable here must also be in public/sitemap.xml.
 */
type RouteHead = { file: string; path: string; title: string; description: string; index: boolean }

const ROUTES: RouteHead[] = [
  {
    file: 'index.html',
    path: '/',
    title: 'Scintillart. Where a spark becomes art.',
    description:
      'Scintillart: artist-led retreats, creative encounters, materials, places and human connection. Where a spark becomes art.',
    index: true,
  },
  {
    file: 'retreats.html',
    path: '/retreats',
    title: 'Our retreats · Scintillart',
    description:
      'An artist-led retreat on the south-west coast of Portugal, 1–7 February 2027: photography, ceramics, performance, life drawing, tea ceremony and more, for 8–16 participants.',
    index: true,
  },
  {
    // A proposal sent directly to hotels: reachable by link, kept out of search engines.
    file: 'arrival-in-lisbon.html',
    path: '/arrival-in-lisbon',
    title: 'An arrival in Lisbon · Scintillart',
    description: 'A cinematic story for boutique hotels, told through photography and film.',
    index: false,
  },
  {
    // Cloudflare Pages serves 404.html with a real 404 status for unknown paths;
    // the client router then shows the not-found view.
    file: '404.html',
    path: '/404',
    title: 'Page not found · Scintillart',
    description: 'This page doesn’t exist.',
    index: false,
  },
]

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function withHead(html: string, route: RouteHead): string {
  const url = SITE + route.path
  const tags = [
    route.index ? `<link rel="canonical" href="${url}" />` : '<meta name="robots" content="noindex, nofollow" />',
  ].join('\n    ')
  const replaced = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(route.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escapeAttr(route.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escapeAttr(route.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escapeAttr(route.description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace('</head>', `  ${tags}\n  </head>`)
  if (!replaced.includes(`<title>${escapeAttr(route.title)}</title>`) || !replaced.includes(tags)) {
    throw new Error(`static route html: could not set the <head> for ${route.file}`)
  }
  return replaced
}

/**
 * Writes one HTML file per route (copies of the built index.html with that route's <head>),
 * so a direct visit to /retreats or /arrival-in-lisbon is served as a real file on any
 * static host. On Cloudflare Pages, /retreats is served from retreats.html without a
 * trailing-slash redirect. Unknown paths get 404.html with a 404 status.
 * Skipped for the shareable preview build, which only ever loads index.html.
 */
function staticRouteHtml(routes: RouteHead[]): Plugin {
  let outDir = 'dist'
  let skip = false
  return {
    name: 'scintillart-static-route-html',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      skip = config.mode === 'preview'
    },
    async closeBundle() {
      if (skip) return
      const html = await readFile(resolve(outDir, 'index.html'), 'utf8')
      for (const route of routes) {
        await writeFile(resolve(outDir, route.file), withHead(html, route))
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), staticRouteHtml(ROUTES)],
  build: {
    // The shareable preview runs in a sandboxed frame that may refuse font files:
    // embed the woff2 fonts in the CSS there. The production build keeps separate, cacheable files.
    assetsInlineLimit: mode === 'preview' ? (file: string) => (file.endsWith('.woff2') ? true : undefined) : 4096,
    target: 'es2020',
    // three.js lives in its own lazily loaded chunk (portal only).
    chunkSizeWarningLimit: 1000,
  },
}))
