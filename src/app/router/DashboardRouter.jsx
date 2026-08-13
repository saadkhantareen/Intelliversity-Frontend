import { lazy } from 'react';
import { useTenant } from '@/features/tenant';

const StudentDashboardPage = lazy(() => import('@/features/dashboard/pages/StudentDashboardPage'));
const AdminDashboardPage = lazy(() => import('@/features/dashboard/pages/AdminDashboardPage'));
const FacultyDashboardPage = lazy(() => import('@features/dashboard/pages/FacultyDashboardPage'));

const PageNotFound = lazy(() => import('@/pages/errors/PageNotFound'));

export default function DashboardRouter() {
  const { tenant } = useTenant();

  if (!tenant) return <PageNotFound />;

  switch (tenant.portal_name) {
    case 'student':
      return <DashboardPage />;

    case 'admin':
      return <AdminDashboardPage />;

    case 'faculty':
      return <FacultyDashboardPage />;

    default:
      return <PageNotFound />;
  }
}
