/**
 * ProtectedRoute.jsx — Guards pages based on login status and role.
 *
 * Checks:
 *   1. Is the app still loading? → Show loading spinner
 *   2. Is there no user at all? → Redirect to /login
 *   3. Is the user logged in but hasn't picked a role? → Redirect to /select-role
 *      (This handles multi-role users who refresh before picking a role)
 *   4. Does their ACTIVE ROLE match the allowed roles? → If NO → /unauthorized
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, activeRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // No user at all → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User exists but no active role selected (multi-role user who hasn't picked yet)
  if (!activeRole) {
    return <Navigate to="/select-role" replace />;
  }

  // User is authenticated but role doesn't match this route's allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
