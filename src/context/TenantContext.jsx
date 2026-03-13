import { createContext, useContext, useState, useEffect } from 'react'

// ── Tenant Config ────────────────────────────────────────────────
const TENANT_CONFIG = {
  student: { label: 'Student Portal',  color: '#0ea5e9' },
  faculty: { label: 'Faculty Portal',  color: '#10b981' },
  admin:   { label: 'Admin Portal',    color: '#f59e0b' },
}

// ── Detect from subdomain ────────────────────────────────────────
function detectTenant() {
  const parts      = window.location.hostname.split('.')
  const portal     = parts[0]   // 'student'
  const university = parts[1]   // 'nust'

  if (!TENANT_CONFIG[portal]) return null

  return { portal, university }
}

// ── Context ──────────────────────────────────────────────────────
const TenantContext = createContext(null)

// ── Provider ─────────────────────────────────────────────────────
export function TenantProvider({ children }) {
  const [portal, setPortal]         = useState(null)
  const [university, setUniversity] = useState(null)
  const [config, setConfig]         = useState(null)
  const [isValid, setIsValid]       = useState(false)
  const [isResolved, setIsResolved] = useState(false)

  useEffect(() => {
    const tenant = detectTenant()
    if (tenant) {
      setPortal(tenant.portal)
      setUniversity(tenant.university)
      setConfig(TENANT_CONFIG[tenant.portal])
      setIsValid(true)
    } else {
      setIsValid(false)
    }
    setIsResolved(true)
  }, [])

  return (
    <TenantContext.Provider value={{ portal, university, config, isValid, isResolved }}>
      {children}
    </TenantContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────
export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used inside <TenantProvider>')
  return ctx
}