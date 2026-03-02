/**
 * useAuth.js — A shortcut hook to access AuthContext.
 * Usage: const { user, activeRole, switchRole, logout } = useAuth()
 */

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}
