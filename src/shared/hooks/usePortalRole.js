import { useMemo } from "react";

export default function usePortalRole() {
  return useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const user = JSON.parse(rawUser);
        if (user.role) return user.role.toLowerCase();
        if (user.is_superuser || user.is_staff) return "admin";
      }
    } catch {
      /* ignore */
    }

    const host = window.location.hostname.toLowerCase();
    if (host.includes("student")) return "student";
    if (host.includes("faculty")) return "faculty";
    if (host.includes("admin")) return "admin";

    const path = window.location.pathname.toLowerCase();
    if (path.startsWith("/student")) return "student";
    if (path.startsWith("/faculty")) return "faculty";
    if (path.startsWith("/admin")) return "admin";

    return "admin";
  }, []);
}