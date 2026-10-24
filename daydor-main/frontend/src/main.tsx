import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NotifyProvider } from '@/lib/notify'
import { SessionProvider } from '@/session/SessionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotifyProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </NotifyProvider>
  </StrictMode>,
)
