import { useTenant } from "@/context/TenantContext";

// Student
import RegisteredCourses from "@/pages/student/RegisteredCourses";

// Admin
import AdminCoursesPage from "@/pages/admin/CoursePage";

// (optional) Faculty
import FacultyCoursesPage from "@/pages/faculty/FacultyCoursesPage"; // create if needed

// Error
import PageNotFound from "@/pages/errors/PageNotFound";

export default function CoursesRouter() {
  const { tenant, isTenantLoading } = useTenant();

  if (isTenantLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading courses...</p>
      </div>
    );
  }

  if (!tenant) return <PageNotFound />;

  switch (tenant.portal_name) {
    case "student":
      return <RegisteredCourses />;

    case "admin":
      return <AdminCoursesPage />;

    case "faculty":
      return <FacultyCoursesPage />; // or temporary div

    default:
      return <PageNotFound />;
  }
}