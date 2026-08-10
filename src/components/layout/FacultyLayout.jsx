import DashboardShell2 from './DashboardShell';
import { useTenant } from '@/context/TenantContext';
import {
  IcGrid as IcGrid2,
  IcBook as IcBook2,
  IcClipboard as IcClipboard2,
  IcCalendar as IcCalendar2,
  IcUsers as IcUsers2,
  IcBell as IcBell2,
  IcMessage,
  IcChart as IcChart2,
} from './icons';

const FACULTY_CONFIG = {
  accent: 'var(--brand-primary)',
  portal: 'faculty',
  label: 'Faculty Portal',
  badge: { bg: 'var(--brand-accent)', text: 'var(--brand-surface)' },
  sections: [
    {
      title: 'Teaching',
      items: [
        { label: 'Dashboard', to: '/dashboard', Icon: IcGrid2 },
        { label: 'Profile', to: '/profile', Icon: IcGrid2 },
        { label: 'My Courses', to: '/courses', Icon: IcBook2 },
        { label: 'Grading', to: '/grading', Icon: IcClipboard2 },
        { label: 'Attendance', to: '/attendance', Icon: IcCalendar2 },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Announcements', to: '/announcements', Icon: IcBell2 },
        { label: 'Messages', to: '/messages', Icon: IcMessage },
        { label: 'Reports', to: '/reports', Icon: IcChart2 },
      ],
    },
  ],
};

export default function FacultyLayout() {
  const { branding } = useTenant();

  const resolvedConfig = {
    ...FACULTY_CONFIG,
    accent: branding?.theme_config?.colors?.primary || FACULTY_CONFIG.accent,
  };

  return <DashboardShell2 config={resolvedConfig} />;
}
