import DashboardShell from './DashboardShell';
import { useTenant } from '@/features/tenant';
import {
  IcGrid, // For Dashboard
  IcClipboard, // For Registration Card
  IcArchive, // For Fees (or use a currency icon if available)
  IcChart, // For Result Card
  IcBell, // For Profile (or use a User icon if available)
  IcBook, // For SoS
} from '@/shared/components/icons';

const STUDENT_CONFIG = {
  accent: 'var(--brand-primary)',
  portal: 'student',
  label: 'Student Portal',
  badge: { bg: 'var(--brand-accent)', text: 'var(--brand-surface)' },
  sections: [
    {
      title: 'Main Menu',
      items: [
        { label: 'Dashboard', to: '/dashboard', Icon: IcGrid },
        { label: 'Profile', to: '/profile', Icon: IcBell },
        { label: 'View Courses', to: '/view-courses', Icon: IcBook },
        { label: 'Registration', to: '/registration', Icon: IcClipboard },
        { label: 'Fees', to: '/fees', Icon: IcArchive },
        { label: 'Result Card', to: '/results', Icon: IcChart },
        { label: 'SoS', to: '/sos', Icon: IcBook },
      ],
    },
  ],
};

export default function StudentLayout() {
  const { branding } = useTenant();

  const resolvedConfig = {
    ...STUDENT_CONFIG,
    accent: branding?.theme_config?.colors?.primary || STUDENT_CONFIG.accent,
  };

  return <DashboardShell config={resolvedConfig} />;
}
