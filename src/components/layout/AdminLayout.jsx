import DashboardShell3 from './DashboardShell';
import { useTenant } from '@/context/TenantContext';
import {
  IcGrid as IcGrid3,
  IcUsers as IcUsers3,
  IcBook as IcBook3,
  IcUpload,
  IcSettings,
  IcChart as IcChart3,
  IcTenant,
  IcArchive as IcArchive3,
  IcBell as IcBell3,
} from './icons';

const ADMIN_CONFIG = {
  accent: 'var(--brand-primary)',
  portal: 'admin',
  label: 'Admin Portal',
  badge: { bg: 'var(--brand-accent)', text: 'var(--brand-surface)' },
  sections: [
    {
      title: 'Management',
      items: [
        { label: 'Dashboard', to: '/dashboard', Icon: IcGrid3 },
        // { label: "Profile", to: "/profile", Icon: IcGrid3 },
      ],
    },
    {
      title: 'Academics',
      items: [
        // These paths now match your App.jsx Route definitions exactly
        {
          label: 'Departments',
          to: '/academics/departments',
          Icon: IcArchive3,
        },
        { label: 'Programs', to: '/academics/programs', Icon: IcArchive3 },
        { label: 'Courses', to: '/academics/courses', Icon: IcBook3 },
        { label: 'Curriculum', to: '/academics/curriculums', Icon: IcBook3 },
        {
          label: 'Academic Years',
          to: '/academics/academic-years',
          Icon: IcArchive3,
        },
        { label: 'Batches', to: '/academics/batches', Icon: IcUsers3 },
        { label: 'Student', to: '/users/students/', Icon: IcBook3 },
        { label: 'Faculty', to: '/users/faculty/', Icon: IcBook3 },
      ],
    },
  ],
};

export default function AdminLayout() {
  const { branding } = useTenant();

  const resolvedConfig = {
    ...ADMIN_CONFIG,
    accent: branding?.theme_config?.colors?.primary || ADMIN_CONFIG.accent,
  };

  return <DashboardShell3 config={resolvedConfig} />;
}
