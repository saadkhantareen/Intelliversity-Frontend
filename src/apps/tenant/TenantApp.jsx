/**
 * TenantApp.jsx — The shell for everything inside a university portal.
 *
 * Wraps everything in TenantProvider and AuthProvider, then renders tenant routes.
 */

import { TenantProvider } from "../../contexts/TenantContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { TenantRoutes } from "./routes";

export function TenantApp() {
  return (
    <TenantProvider>
      <AuthProvider>
        <TenantRoutes />
      </AuthProvider>
    </TenantProvider>
  );
}
