import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const DashboardPage      = lazy(() => import('@/pages/student/DashboardPage'))
const NotFound           = lazy(() => import('@/pages/errors/NotFound'))

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
        <Route path="/login"                          element={<LoginPage />} />
        <Route path="/forgot-password"                element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uidb64/:token"  element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
