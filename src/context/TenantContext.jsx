import { createContext, useContext, useMemo } from 'react'

const TENANT_CONFIG = {
  student: { label: 'Student Portal',  color: '#0ea5e9' },
  faculty: { label: 'Faculty Portal',  color: '#10b981' },
  admin:   { label: 'Admin Portal',    color: '#f59e0b' },
}

function detectTenant() {
  const parts      = window.location.hostname.split('.')
  const portal     = parts[0]
  const university = parts[1]

  if (!TENANT_CONFIG[portal]) return null

  return { portal, university, config: TENANT_CONFIG[portal] }
}

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const value = useMemo(() => {
    const tenant = detectTenant()
    if (tenant) {
      return {
        portal:     tenant.portal,
        university: tenant.university,
        config:     tenant.config,
        isValid:    true,
      }
    }
    return { portal: null, university: null, config: null, isValid: false }
  }, [])

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used inside <TenantProvider>')
  return ctx
}
