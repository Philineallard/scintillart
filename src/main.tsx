import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router'
import App from './App'
import './styles/fonts'
import './styles/tokens.css'
import './styles/base.css'

// The shareable preview build (npm run build:preview) runs inside a sandboxed frame
// without real URLs, so it keeps the route in memory instead of the address bar.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
