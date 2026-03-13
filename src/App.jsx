import './App.css'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/student/DashboardPage'
import NotFound from './pages/errors/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/login"                          element={<LoginPage />} />
      <Route path="/forgot-password"                element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:uidb64/:token"  element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App