import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/student/DashboardPage"));
const PortalNotFound = lazy(() => import("@/pages/errors/PortalNotFound"));
const PageNotFound = lazy(() => import("@/pages/errors/PageNotFound"));

const BulkUploadPage = lazy(() => import('@/pages/admin/BulkUploadPage'));
const StudentProfilePage = lazy(() => import('@/pages/student/StudentProfilePage'));
const FacultyProfilePage = lazy(() => import('@/pages/faculty/FacultyProfilePage'));
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'));
const UsersPage = lazy(() => import('@/pages/admin/UserPage'));
const UserDetailPage = lazy(() => import('@/pages/admin/UserDetailPage'));
const StudentLayout = lazy(() => import('./components/layout/StudentLayout'));
const FacultyLayout = lazy(() => import('./components/layout/FacultyLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));


function ProfileRouter() {
  const { portal } = useTenant()

  if (portal === 'student') return <StudentProfilePage />
  if (portal === 'faculty') return <FacultyProfilePage />
  if (portal === 'admin')   return <AdminProfilePage />
  return <NotFound />
}

function PortalLayoutRouter() {
  const { tenant } = useTenant()

  if (tenant.portal_name === 'student') return <StudentLayout />
  if (tenant.portal_name === 'faculty') return <FacultyLayout />
  if (tenant.portal_name === 'admin')   return <AdminLayout />
  return <Outlet />
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:uidb64/:token"
          element={<ResetPasswordPage />}
        />

      <Route element={<ProtectedRoute />}>
        <Route element={<PortalLayoutRouter />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile"   element={<ProfileRouter />} />
          <Route path="/users"   element={<UsersPage />} />
          <Route path="/users/bulk-upload"   element={<BulkUploadPage />} />
          <Route path="/users/:userId"   element={<UserDetailPage />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
        <Route path="/portal-not-found" element={<PortalNotFound />} />
      </Routes>
    </Suspense>
  );

export default App;
