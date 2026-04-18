import { createContext, useContext, useEffect, useState } from "react";
import { globalService } from "@/services/global.service";
import { applyThemeToCSS, applyFavicon } from "@/utils/tenantUtils";

const TenantContext = createContext(null);


export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      try {
        const domain = window.location.hostname;

        const res = await globalService.getTenantBranding(domain);

        if (res.status !== 200 || !res.data) {
          throw new Error("Invalid tenant");
        }

        const data = res.data;

        setTenant(data);

        applyThemeToCSS(data.theme_config);
        applyFavicon(data.favicon_url);
      } catch (err) {
        console.log("Error!");
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadTenant();
  }, []);

  return (
    <TenantContext.Provider
      value={{ tenant, isTenantLoading: isLoading, error }}
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
