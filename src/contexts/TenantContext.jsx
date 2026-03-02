/**
 * TenantContext.jsx — Holds information about the current university (tenant).
 *
 * Stores:
 *   - tenant: { id, name, slug, logo, themeColor }
 *   - isLoading: true/false
 *   - error: any error if tenant slug was not found
 */

import { createContext, useState, useEffect } from "react";
import { resolveTenant } from "../lib/api/tenants.api";
import { extractSubdomain } from "../lib/utils";

export const TenantContext = createContext({
  tenant: null,
  isLoading: true,
  error: null,
});

/**
 * TenantProvider — Wraps the entire tenant portal.
 *
 * Flow:
 * 1. Extract subdomain from URL (e.g., "nust")
 * 2. Call backend: GET /api/v1/tenants/resolve/?slug=nust
 * 3. If found → store tenant info, show the app
 * 4. If not found → show "University Not Found" error
 */
export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const slug = extractSubdomain();

    if (!slug) {
      setIsLoading(false);
      return;
    }

    // Save the slug so the API client can use it as X-Tenant-Token header
    localStorage.setItem("tenantToken", slug);

    resolveTenant(slug)
      .then((data) => {
        setTenant(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "University not found");
        setIsLoading(false);
      });
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
