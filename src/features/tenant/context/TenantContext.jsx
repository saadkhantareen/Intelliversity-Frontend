import { createContext, useContext, useEffect, useState } from 'react';
import { getPortalBranding } from '@/features/branding';
import { applyFavicon } from '../utils/tenantUtils';
import { applyThemeToCSS } from '../utils/tenantUtils';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [branding, setBranding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      try {
        const domain = window.location.hostname;

        const res = await getPortalBranding(domain);

        if (res.status !== 200) {
          throw new Error('Invalid tenant response');
        }

        const data = res.data;

        /* An unregistered domain used to come back as 200 {} rather than a 404.
           `!res.data` does not catch that - an empty object is truthy - so tenant
           was set to {} and every downstream `if (!tenant)` guard (DashboardRouter's
           PageNotFound, PortalRouter's portal switch) sailed straight past it and
           rendered a portal with no identity. Require an actual portal identity so
           an empty payload is treated as a missing tenant, whatever the status. */
        if (!data || typeof data !== 'object' || !data.portal_name) {
          throw new Error('Invalid tenant response');
        }

        setTenant(data);
        setBranding(data);

        const theme = data.theme_config ?? data;
        if (theme) {
          applyThemeToCSS(theme);
        }
        applyFavicon(data.favicon_url);
      } catch (err) {
        console.log('message:', err?.message);
        console.log('status:', err?.response?.status);
        console.log('data:', err?.response?.data);

        setError(err?.message || 'Failed to load tenant');
      } finally {
        setIsLoading(false);
      }
    }

    loadTenant();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        branding,
        isTenantLoading: isLoading,
        brandingLoading: isLoading,
        error,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used inside <TenantProvider>');
  return ctx;
}
