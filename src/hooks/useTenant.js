/**
 * useTenant.js — A shortcut hook to access TenantContext.
 * Usage: const { tenant } = useTenant()
 */

import { useContext } from "react";
import { TenantContext } from "../contexts/TenantContext";

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used inside a <TenantProvider>");
  }
  return context;
}
