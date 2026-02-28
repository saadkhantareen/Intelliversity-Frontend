/**
 * Platform Routes — Pages available to the Super Admin.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import PlatformDashboard from "./pages/Dashboard";

export function PlatformRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlatformDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
