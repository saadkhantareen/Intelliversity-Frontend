import './App.css'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'
import { useTenant } from './context/TenantContext'

import { StudentLayout } from './components/layout/StudentLayout'
import { AdminLayout } from './components/layout/AdminLayout'
import { FacultyLayout } from './components/layout/FacultyLayout'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

import DashboardPage from './pages/student/DashboardPage'
import NotFound from './pages/errors/NotFound'

function PortalLayout() {
  const { portal } = useTenant()

  if (portal === 'admin') return <AdminLayout />
  if (portal === 'faculty') return <FacultyLayout />
  return <StudentLayout />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<PortalLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App