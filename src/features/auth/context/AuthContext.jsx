import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { authService } from '../api/auth.service';
import { normalizeAuthError } from '../utils/authValidation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // login button
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // initial check
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        // decode JWT and check expiry
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setIsCheckingAuth(false);
          return;
        }

        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
    setIsCheckingAuth(false);
  }, []);

  /**
   * Authenticate the user.
   *
   * Always REJECTS on failure (previously the `detail` branch returned early,
   * which made callers treat a failed request as success and navigate to
   * /dashboard). The thrown Error carries `isAuthError` + a normalised message
   * so the login page can surface one inline message instead of a duplicate
   * toast. Success/failure messaging is intentionally split:
   *   - success -> toast here (single announcement)
   *   - failure -> inline error on the page (proximity + recovery)
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login(credentials);
      const { tokens, user, university } = res.data ?? {};

      if (!tokens?.access || !tokens?.refresh || !user) {
        throw new Error('Unexpected login response from the server.');
      }

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify({ ...user, university }));

      setToken(tokens.access);
      setUser({ ...user, university });
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${user.first_name || 'there'}!`);

      return { ok: true, user: { ...user, university } };
    } catch (err) {
      const message = normalizeAuthError(err);
      setError(message);

      const normalized = new Error(message);
      normalized.isAuthError = true;
      normalized.cause = err;
      throw normalized;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        isAuthLoading: isLoading, // 👈 alias add karo
        isCheckingAuth,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
