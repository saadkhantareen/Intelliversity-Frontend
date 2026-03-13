import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]                       = useState(null)
  const [token, setToken]                     = useState(localStorage.getItem('access_token') || null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading]             = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    const savedUser  = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (credentials) => {
    setIsLoading(true)
    try {
      const res = await authService.login(credentials)
      const { tokens, user, university } = res.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      localStorage.setItem('user', JSON.stringify({ ...user, university }))

      setUser({ ...user, university })
      setToken(tokens.access)
      setIsAuthenticated(true)
      toast.success(`Welcome back, ${user.first_name}!`)
    } catch (err) {
      const errors = err.response?.data
      // backend returns nested error objects
      const message =
        errors?.non_field_errors?.[0]?.detail ||
        errors?.detail ||
        errors?.email?.[0]?.detail ||
        errors?.password?.[0]?.detail ||
        'Login failed'
      toast.error(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}