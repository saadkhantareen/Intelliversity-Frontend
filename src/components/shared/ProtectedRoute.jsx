import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  // auth check ho raha hai — wait karo
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  // authenticated nahi — login pe bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // authenticated — page dikhao
  return <Outlet />
}

export default ProtectedRoute