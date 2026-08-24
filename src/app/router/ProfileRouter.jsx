import { lazy } from 'react';

import { useTenant } from '@/features/tenant';
import PageNotFound from '@/app/pages/errors/PageNotFound';

const StudentProfilePage = lazy(() => import('@/features/profile/pages/StudentProfilePage'));
const FacultyProfilePage = lazy(() => import('@/features/profile/pages/FacultyProfilePage'));
const AdminProfilePage = lazy(() => import('@/features/profile/pages/AdminProfilePage'));

export default function ProfileRouter() {
  const { tenant } = useTenant();

  switch (tenant?.portal_name) {
    case 'student':
      return <StudentProfilePage />;

    case 'faculty':
      return <FacultyProfilePage />;

    case 'admin':
      return <AdminProfilePage />;

    default:
      return <PageNotFound />;
  }
}
