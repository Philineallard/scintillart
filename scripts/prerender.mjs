// Build step 3 of 3 (see "build" in package.json): renders the listed routes with the
// server bundle (dist-ssr/entry-server.js) and writes the HTML into their static files
// in dist/ (created by the static-route plugin in vite.config.ts), so crawlers see the
// content. The client then hydrates it (src/main.tsx). dist-ssr is removed afterwards.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const PAGES = [{ file: 'thespark.html', url: '/thespark' }]

const dist = resolve('dist')
const ssrDir = resolve('dist-ssr')
const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)

const EMPTY_ROOT = '<div id="root"></div>'

for (const page of PAGES) {
  const file = resolve(dist, page.file)
  const html = await readFile(file, 'utf8')
  if (!html.includes(EMPTY_ROOT)) throw new Error(`prerender: no empty #root in ${page.file}`)
  const body = render(page.url)
  if (!body) throw new Error(`prerender: ${page.url} rendered nothing`)
  await writeFile(file, html.replace(EMPTY_ROOT, `<div id="root">${body}</div>`))
  console.log(`prerendered ${page.url} -> dist/${page.file} (${(body.length / 1024).toFixed(1)} kB)`)
}

await rm(ssrDir, { recursive: true, force: true })
