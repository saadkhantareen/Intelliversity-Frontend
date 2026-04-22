import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";
import { useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                       = useState(null)
  const [token, setToken]                     = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading]             = useState(false)   // login button
  const [isCheckingAuth, setIsCheckingAuth]   = useState(true)    // initial check
  const [error, setError]                     = useState(null)

  useEffect(() => {
  const savedToken = localStorage.getItem('access_token')
  const savedUser  = localStorage.getItem('user')

  if (savedToken && savedUser) {
    try {
      // decode JWT and check expiry
      const payload = JSON.parse(atob(savedToken.split('.')[1]))
      const isExpired = payload.exp * 1000 < Date.now()

      if (isExpired) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setIsCheckingAuth(false)
        return
      }

      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    } catch (err) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  }
  setIsCheckingAuth(false)
}, [])

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const { tokens, user, university } = res.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify({ ...user, university }));

       setToken(tokens.access);
    setUser({ ...user, university });
    setIsAuthenticated(true);
      toast.success(`Welcome back, ${user.first_name}!`);
    } catch (err) {
      // Check for recaptcha or authentication errors - don't redirect
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
        toast.error(err.response.data.detail);
        return;
      }

      const errors = err.response?.data
      console.log('error response:', errors)
      const message =
        errors?.non_field_errors?.[0]?.detail ||
        errors?.non_field_errors?.[0] ||
        errors?.detail ||
        errors?.recaptcha_token?.[0] ||
        errors?.email?.[0]?.detail ||
        errors?.email?.[0] ||
        errors?.password?.[0]?.detail ||
        errors?.password?.[0] ||
        "Login failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setToken(null);
  setUser(null);
  setIsAuthenticated(false);
  })

  return (
    <AuthContext.Provider value={{ 
  user, token, isAuthenticated, 
  isLoading,
  isAuthLoading: isLoading,  // 👈 alias add karo
  isCheckingAuth, error, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
