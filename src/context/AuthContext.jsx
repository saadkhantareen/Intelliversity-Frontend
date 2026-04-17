import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

function loadStoredAuth() {
  const savedToken = localStorage.getItem("access_token");
  const savedUser = localStorage.getItem("user");
  if (savedToken && savedUser) {
    return {
      token: savedToken,
      user: JSON.parse(savedUser),
      isAuthenticated: true,
    };
  }
  return { token: null, user: null, isAuthenticated: false };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const { tokens, user, university } = res.data;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify({ ...user, university }));

      setAuth({
        user: { ...user, university },
        token: tokens.access,
        isAuthenticated: true,
      });
      toast.success(`Welcome back, ${user.first_name}!`);
    } catch (err) {
      const errors = err.response?.data;
      const message =
        errors?.non_field_errors?.[0]?.detail ||
        errors?.detail ||
        errors?.email?.[0]?.detail ||
        errors?.password?.[0]?.detail ||
        "Login failed";
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

    setAuth({ token: null, user: null, isAuthenticated: false });
    toast.success("Logged out successfully");
  }, []);

  const value = {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isAuthLoading: isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
