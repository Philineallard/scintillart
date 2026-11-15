import { Navigate } from 'react-router'

/**
 * Unknown paths go straight to the homepage. On Cloudflare Pages the server still
 * answers them with 404.html and a 404 status (see vite.config.ts), so search engines
 * drop dead URLs while visitors simply land on the entry page.
 */
export default function NotFound() {
  return <Navigate to="/" replace />
}
