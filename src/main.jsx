import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TenantProvider } from '@/context/TenantContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import '@/index.css'
import App from '@/App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  </StrictMode>,
)
