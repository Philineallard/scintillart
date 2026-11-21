/**
 * Entry for the dashboard (drag-and-drop) upload, which cannot compile the `functions/` folder.
 * `npm run build:worker` bundles this file into `dist/_worker.js` (Pages "advanced mode") and
 * writes `dist/_routes.json` so only /api/* runs the Worker; every other path is served as a
 * static file, with `_redirects` and `_headers` applied as before.
 *
 * Keep in step with the files in functions/ (today only /api/register).
 */
import { onRequestPost } from '../functions/api/register.ts'

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  [key: string]: unknown
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/register') {
      if (request.method === 'POST') return onRequestPost({ request, env: env as never })
      return new Response(null, { status: 405, headers: { allow: 'POST' } })
    }
    return env.ASSETS.fetch(request)
  },
}
