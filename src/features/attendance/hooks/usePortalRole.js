// src/hooks/usePortalRole.js
import { useMemo } from "react";

/**
 * Returns "student" | "faculty" | "admin".
 * Subdomain wins; "teacher" is normalized to "faculty".
 */
export default function usePortalRole() {
  return useMemo(() => {
    const first = window.location.hostname.toLowerCase().split(".")[0];
    if (first === "admin") return "admin";
    if (first === "faculty" || first === "teacher") return "faculty";
    if (first === "student") return "student";

    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const raw = []
        .concat(user?.roles || [])
        .concat(user?.groups || [])
        .concat(user?.role ? [user.role] : [])
        .map((r) => String(r?.name || r).toLowerCase());

      if (raw.some((r) => r.includes("admin"))) return "admin";
      if (raw.some((r) => r.includes("faculty") || r.includes("teacher"))) return "faculty";
      if (raw.some((r) => r.includes("student"))) return "student";
    } catch {
      /* ignore */
    }
    return "student";
  }, []);
}
