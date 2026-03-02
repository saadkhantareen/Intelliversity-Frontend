/**
 * TenantApp.jsx — The shell for everything inside a university portal.
 *
 * Wraps everything in TenantProvider and AuthProvider, then renders tenant routes.
 * Includes a TenantGuard that redirects to the root domain if the tenant
 * (university) is not found in the backend.
 */

import { TenantProvider } from "../../contexts/TenantContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { useTenant } from "../../hooks/useTenant";
import { TenantRoutes } from "./routes";

/**
 * TenantGuard — Checks if the tenant was resolved successfully.
 *
 * - Loading → show a spinner/message
 * - Error (tenant not found) → redirect to the root domain
 * - Success → render children (the app)
 */
function TenantGuard({ children }) {
  const { tenant, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading university portal...</p>
      </div>
    );
  }

  if (error || !tenant) {
    // Redirect to root domain — this university doesn't exist
    const rootDomain =
      import.meta.env.VITE_ROOT_DOMAIN || "http://localhost:5173";
    window.location.href = rootDomain;
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">University not found. Redirecting...</p>
      </div>
    );
  }

  return children;
}

export function TenantApp() {
  return (
    <TenantProvider>
      <TenantGuard>
        <AuthProvider>
          <TenantRoutes />
        </AuthProvider>
      </TenantGuard>
    </TenantProvider>
  );
}
