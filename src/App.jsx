import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useTenant } from "./context/TenantContext";

// Auth Pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

// Shared Pages
const PortalNotFound = lazy(() => import("@/pages/errors/PortalNotFound"));
const PageNotFound = lazy(() => import("@/pages/errors/PageNotFound"));

// Dashboard / Profile Pages
const DashboardPage = lazy(() => import("@/pages/student/DashboardPage"));
const StudentProfilePage = lazy(() => import("@/pages/student/StudentProfilePage"));
const FacultyProfilePage = lazy(() => import("@/pages/faculty/FacultyProfilePage"));
const AdminProfilePage = lazy(() => import("@/pages/admin/AdminProfilePage"));

// Admin Pages
const UsersPage = lazy(() => import("@/pages/admin/UserPage"));
const UserDetailPage = lazy(() => import("@/pages/admin/UserDetailPage"));
const BulkUploadPage = lazy(() => import("@/pages/admin/BulkUploadPage"));

// Layouts
const StudentLayout = lazy(() => import("@/components/layout/StudentLayout"));
const FacultyLayout = lazy(() => import("@/components/layout/FacultyLayout"));
const AdminLayout = lazy(() => import("@/components/layout/AdminLayout"));

function FullScreenLoader({ text = "Loading..." }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

function ProfileRouter() {
  const { tenant } = useTenant();

  switch (tenant?.portal_name) {
    case "student":
      return <StudentProfilePage />;
    case "faculty":
      return <FacultyProfilePage />;
    case "admin":
      return <AdminProfilePage />;
    default:
      return <PageNotFound />;
  }
}

function PortalLayoutRouter() {
  const { tenant, isTenantLoading, error } = useTenant();

  if (isTenantLoading) return <FullScreenLoader text="Loading portal..." />;
  if (error || !tenant) return <PortalNotFound />;

  switch (tenant.portal_name) {
    case "student":
      return <StudentLayout />;
    case "faculty":
      return <FacultyLayout />;
    case "admin":
      return <AdminLayout />;
    default:
      return <PortalNotFound />;
  }
}

function ProtectedAppRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<PortalLayoutRouter />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfileRouter />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/bulk-upload" element={<BulkUploadPage />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />
      </Route>
    </Route>
  );
}

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:uidb64/:token"
          element={<ResetPasswordPage />}
        />

        {/* Private Routes */}
        {ProtectedAppRoutes()}

        {/* Error Routes */}
        <Route path="/portal-not-found" element={<PortalNotFound />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}
