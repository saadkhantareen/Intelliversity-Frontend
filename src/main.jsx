import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TenantProvider } from './context/TenantContext'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'


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

// **Order important hai:**
// ```
// BrowserRouter       ← Routing
//   TenantProvider    ← Tenant detect karo
//     App             ← Baaki sab