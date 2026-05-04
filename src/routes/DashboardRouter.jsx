import { useTenant } from "@/context/TenantContext";

// Dashboards
import DashboardPage from "@/pages/student/DashboardPage";
import AdminDashboardPage from "@/pages/admin/Dashboard";
import FacultyDashboardPage from "@/pages/faculty/FacultyDashboardPage"; // create if not exists

// Error
import PageNotFound from "@/pages/errors/PageNotFound";

export default function DashboardRouter() {
  const { tenant } = useTenant();

  if (!tenant) return <PageNotFound />;

  switch (tenant.portal_name) {
    case "student":
      return <DashboardPage />;

    case "admin":
      return <AdminDashboardPage />;

    case "faculty":
      return <FacultyDashboardPage />;

    default:
      return <PageNotFound />;
  }
}