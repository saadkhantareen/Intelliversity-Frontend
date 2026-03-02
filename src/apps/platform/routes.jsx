/**
 * Platform Routes — Pages available to the Super Admin.
 *
 * /login     → Public login page
 * /dashboard → Protected super admin dashboard
 * /          → Redirects to /dashboard (which bounces to /login if unauthenticated)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../../router/ProtectedRoute";
import PlatformLoginPage from "./pages/auth/LoginPage";
import PlatformDashboard from "./pages/Dashboard";

export function PlatformRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PlatformLoginPage />} />

      {/* Protected — super_admin only */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <PlatformDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root → dashboard (ProtectedRoute will redirect to /login if needed) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
