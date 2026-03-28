import BulkUploadPage from './pages/admin/BulkUploadPage';
import './App.css'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/student/DashboardPage'
import StudentProfilePage from './pages/student/StudentProfilePage'
import FacultyProfilePage from './pages/faculty/FacultyProfilePage'
import AdminProfilePage from './pages/admin/AdminProfilePage'
import NotFound from './pages/errors/NotFound'
import { useTenant } from './context/TenantContext'
import UsersPage from './pages/admin/UserPage'
import UserDetailPage from './pages/admin/UserDetailPage'

function ProfileRouter() {
  const { portal } = useTenant()

  if (portal === 'student') return <StudentProfilePage />
  if (portal === 'faculty') return <FacultyProfilePage />
  if (portal === 'admin')   return <AdminProfilePage />
  return <NotFound />
}

import { StudentLayout } from './components/layout/StudentLayout'
import { FacultyLayout } from './components/layout/FacultyLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { Outlet } from 'react-router-dom'

function PortalLayoutRouter() {
  const { portal } = useTenant()

  if (portal === 'student') return <StudentLayout />
  if (portal === 'faculty') return <FacultyLayout />
  if (portal === 'admin')   return <AdminLayout />
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/login"                         element={<LoginPage />} />
      <Route path="/forgot-password"               element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<PortalLayoutRouter />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile"   element={<ProfileRouter />} />
          <Route path="/users"   element={<UsersPage />} />
          <Route path="/users/bulk-upload"   element={<BulkUploadPage />} />
          <Route path="/users/:userId"   element={<UserDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App