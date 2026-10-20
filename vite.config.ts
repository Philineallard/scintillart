import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Emits dist/retreats.html (a copy of index.html) so that a direct visit to
 * /retreats is served as a real file on any static host. On Cloudflare Pages,
 * /retreats is then served from retreats.html without a trailing-slash redirect.
 * Unknown paths fall back to index.html (Pages' default SPA behaviour when no
 * 404.html exists), where the client router shows the not-found view.
 */
function staticRouteHtml(routes: string[]): Plugin {
  let outDir = 'dist'
  return {
    name: 'scintillart-static-route-html',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      for (const route of routes) {
        await copyFile(resolve(outDir, 'index.html'), resolve(outDir, `${route}.html`))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), staticRouteHtml(['retreats'])],
  build: {
    target: 'es2020',
    // three.js lives in its own lazily loaded chunk (portal only).
    chunkSizeWarningLimit: 1000,
  },
})
