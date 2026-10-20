import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router'
import App from './App'
import './styles/fonts'
import './styles/tokens.css'
import './styles/base.css'

// The shareable preview build (npm run build:preview) runs inside a sandboxed frame
// without real URLs, so it keeps the route in memory instead of the address bar.
// Measure the platform's scrollbar once (0 on overlay-scrollbar systems). The entry page hides
// its scrollbar; the transition layer uses this so /retreats lines up exactly when it arrives.
{
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;top:-999px;width:100px;height:100px;overflow:scroll'
  document.body.appendChild(probe)
  document.documentElement.style.setProperty('--scrollbar-width', `${probe.offsetWidth - probe.clientWidth}px`)
  probe.remove()
}

const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
