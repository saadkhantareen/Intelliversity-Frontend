// TenantContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getPortalBranding } from "@/services/branding.service";
import { applyFavicon } from "@/utils/tenantUtils";
import { applyBrandingToCSSVariables } from "@/utils/applyBranding";

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

        if (res.status !== 200 || !res.data) {
          throw new Error("Invalid tenant response");
        }

        const data = res.data;

        setTenant(data);
        setBranding(data);

        const theme = data.theme_config ?? data;
        applyBrandingToCSSVariables(theme);
        applyFavicon(data.favicon_url);
      } catch (err) {
  console.log("message:", err?.message);
  console.log("status:", err?.response?.status);
  console.log("data:", err?.response?.data);

  setError(err?.message || "Failed to load tenant");
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
  if (!ctx) throw new Error("useTenant must be used inside <TenantProvider>");
  return ctx;
}