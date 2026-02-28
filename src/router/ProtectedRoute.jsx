/**
 * ProtectedRoute.jsx — Guards pages based on login status and role.
 *
 * Checks:
 *   1. Is the user logged in? → If NO → redirect to /login
 *   2. Does their ACTIVE ROLE match the allowed roles? → If NO → redirect to /unauthorized
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, activeRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
