/**
 * routes.jsx (tenant) — All pages available inside a university portal.
 *
 * Every role-specific route is wrapped with <ProtectedRoute allowedRoles={[...]}>
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../../router/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

// Auth pages (public)
import LoginPage from "./pages/auth/LoginPage";
import RolePickerPage from "./pages/auth/RolePickerPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";

// Teacher pages
import TeacherDashboard from "./pages/teacher/Dashboard";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";

/**
 * RoleRedirect — After login + role selection, redirect to the correct dashboard.
 */
function RoleRedirect() {
  const { activeRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const dashboardMap = {
    admin: "/admin/dashboard",
    teacher: "/teacher/dashboard",
    student: "/student/dashboard",
  };

  return <Navigate to={dashboardMap[activeRole] || "/login"} replace />;
}

export function TenantRoutes() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES === */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-role" element={<RolePickerPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root path → redirect based on role */}
      <Route path="/" element={<RoleRedirect />} />

      {/* === ADMIN ROUTES === */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* === TEACHER ROUTES === */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* === STUDENT ROUTES === */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
