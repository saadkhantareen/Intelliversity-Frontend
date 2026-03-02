/**
 * PlatformApp.jsx — The shell for the Super Admin portal.
 *
 * Renders when there is NO subdomain (e.g., intelliversity.com).
 * No TenantContext needed — there's no specific tenant.
 */

import { AuthProvider } from "../../contexts/AuthContext";
import { PlatformRoutes } from "./routes";

export function PlatformApp() {
  return (
    <AuthProvider>
      <PlatformRoutes />
    </AuthProvider>
  );
}
