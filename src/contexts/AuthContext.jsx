/**
 * AuthContext.jsx — Handles authentication and the MULTI-ROLE system.
 *
 * Stores:
 *   - user: { id, name, email, roles: ["teacher", "student"] }
 *   - roles: ["teacher", "student"] — ALL roles this user has
 *   - activeRole: "teacher" — the role they CURRENTLY chose to use
 *   - isAuthenticated: true/false
 *
 * Multi-Role Flow:
 *   1. User logs in → backend returns roles array
 *   2. If only 1 role → auto-select it, go straight to dashboard
 *   3. If multiple roles → show Role Picker screen
 *   4. User picks a role → activeRole is set → role-specific UI loads
 *   5. User can switch role anytime via header dropdown
 */

import { createContext, useState, useCallback, useEffect } from "react";
import { login as loginApi, getMe } from "../lib/api/auth.api";

export const AuthContext = createContext({
  user: null,
  roles: [],
  activeRole: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  switchRole: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On app startup, check if there's a saved token.
   * If yes, validate it by calling getMe() and restore the session.
   */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedRole = localStorage.getItem("activeRole");

    if (token) {
      getMe()
        .then((userData) => {
          setUser(userData);
          setRoles(userData.roles || []);
          if (savedRole && userData.roles?.includes(savedRole)) {
            setActiveRole(savedRole);
          }
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.clear();
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  /**
   * login() — Called when user submits the login form.
   * Returns the user's roles so the login page can decide next step.
   */
  const login = useCallback(async (email, password) => {
    const data = await loginApi(email, password);

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    setUser(data.user);
    setRoles(data.user.roles);

    // If user has only one role, auto-select it
    if (data.user.roles.length === 1) {
      const onlyRole = data.user.roles[0];
      setActiveRole(onlyRole);
      localStorage.setItem("activeRole", onlyRole);
    }

    return data.user.roles;
  }, []);

  /**
   * switchRole() — Change the active role WITHOUT logging out.
   */
  const switchRole = useCallback(
    (newRole) => {
      if (roles.includes(newRole)) {
        setActiveRole(newRole);
        localStorage.setItem("activeRole", newRole);
      }
    },
    [roles]
  );

  /**
   * logout() — Clear everything and redirect to login.
   */
  const logout = useCallback(() => {
    setUser(null);
    setRoles([]);
    setActiveRole(null);
    localStorage.clear();
    window.location.href = "/login";
  }, []);

  const isAuthenticated = !!user && !!activeRole;

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        activeRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
