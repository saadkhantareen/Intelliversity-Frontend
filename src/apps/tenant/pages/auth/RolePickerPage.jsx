/**
 * RolePickerPage.jsx — Fallback redirect.
 *
 * The role picker is now inline on the login page (Step 2).
 * If a user lands here directly (e.g., from a bookmark or session restore),
 * redirect them to the login page which handles both steps.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";

const dashboardMap = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export default function RolePickerPage() {
  const { user, activeRole } = useAuth();

  // If user is already logged in with an active role, go to their dashboard
  if (user && activeRole) {
    return <Navigate to={dashboardMap[activeRole] || "/"} replace />;
  }

  // Otherwise redirect to login (role picker is now part of the login page)
  return <Navigate to="/login" replace />;
}
