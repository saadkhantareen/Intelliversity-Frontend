import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]                       = useState(null)
  const [token, setToken]                     = useState(
    localStorage.getItem('token') || null   // ← localStorage se uthao
  )
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading]             = useState(false)

  // ── Page refresh pe token check karo ──
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
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

      // localStorage mein save karo
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      setUser(res.data.user)
      setToken(res.data.token)
      setIsAuthenticated(true)
      toast.success(`Welcome back, ${res.data.user.name}!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
      throw err  // ← yeh add karo
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.log(err)
    } finally {
      // localStorage clear karo
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
// ```

// ---

// **Test karo:**
// ```
// Login karo         → token localStorage mein save ✅
// Page refresh karo  → token localStorage se uthao ✅
// Dashboard pe raho  → /login pe redirect nahi ✅
// Logout karo        → localStorage clear ✅