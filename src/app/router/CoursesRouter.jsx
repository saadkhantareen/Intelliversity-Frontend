import { lazy } from 'react';
import { useTenant } from '@/features/tenant';

const RegisteredCourses = lazy(() => import('@/features/courses/pages/student/RegisteredCourses'));
const AdminCoursesPage = lazy(() => import('@/features/courses/pages/admin/CourseList'));
const FacultyCoursesPage = lazy(() => import('@/features/courses/pages/faculty/FacultyCoursesPage'));
const PageNotFound = lazy(() => import('@/app/pages/errors/PageNotFound'));

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
      return <AdminCoursesPage />;

    case 'faculty':
      return <FacultyCoursesPage />; // or temporary div

    default:
      return <PageNotFound />;
  }
}
