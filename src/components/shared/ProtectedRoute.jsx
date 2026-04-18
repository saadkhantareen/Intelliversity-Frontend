import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'


function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth, user } = useAuth()
  const { portal } = useTenant()


  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (portal && user?.roles && !user.roles.includes(portal)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-500">You don't have permission to access this portal.</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
