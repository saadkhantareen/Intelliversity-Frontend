import { useState } from 'react'
import './App.css'
import { useTenant } from './context/TenantContext'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/student/DashboardPage'
import NotFound from './pages/errors/NotFound'
import {Routes , Route} from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'

function App() {
   const tenant = useTenant()

  return (
   <Routes>
      <Route path="/login"     element={<LoginPage />} />
       <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*"          element={<NotFound />} />
    </Routes>
  )
}

export default App
