import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router'
import App from './App'
import './styles/fonts'
import './styles/tokens.css'
import './styles/brand.css'
import './styles/base.css'

// The shareable preview build (npm run build:preview) runs inside a sandboxed frame
// without real URLs, so it keeps the route in memory instead of the address bar.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

const app = (
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
)

// Pre-rendered pages (scripts/prerender.mjs, e.g. /thespark) arrive with their HTML in
// #root: hydrate it. Every other page starts empty and renders on the client.
const root = document.getElementById('root')!
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
