import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import './index.css'

// HashRouter is used (rather than BrowserRouter) so deep links survive a hard
// refresh on GitHub Pages without a server-side 404 fallback. GitHub Pages only
// serves static files, so hash-based routing is the most robust choice.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
