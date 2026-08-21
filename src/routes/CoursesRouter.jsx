import { useTenant } from '@/context/TenantContext';

// Student
import RegisteredCourses from '@/pages/student/RegisteredCourses';

// Admin & Faculty
import CourseList from '@/pages/admin/CourseList';

// Error
import PageNotFound from '@/pages/errors/PageNotFound';

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
    case 'student':
      return <RegisteredCourses />;

    case 'admin':
    case 'faculty':
      return <CourseList />;

    default:
      return <PageNotFound />;
  }
}
