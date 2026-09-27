import { lazy } from 'react';

import { useTenant } from '@/features/tenant';

const StudentLayout = lazy(() => import('@/app/layouts/StudentLayout'));
const FacultyLayout = lazy(() => import('@/app/layouts/FacultyLayout'));
const AdminLayout = lazy(() => import('@/app/layouts/AdminLayout'));

const PortalNotFound = lazy(() => import('@/app/pages/errors/PortalNotFound'));

function FullScreenLoader({ text = 'Loading...' }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-400">{text}</p>
    </div>
  );
}

export default function PortalRouter() {
  const { tenant, isTenantLoading, error } = useTenant();

  if (isTenantLoading) {
    return <FullScreenLoader text="Loading portal..." />;
  }

  if (error || !tenant) {
    return <PortalNotFound />;
  }

  switch (tenant.portal_name) {
    case 'student':
      return <StudentLayout />;

    case 'faculty':
      return <FacultyLayout />;

    case 'admin':
      return <AdminLayout />;

    default:
      return <PortalNotFound />;
  }
}
