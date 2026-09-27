import DashboardShell from './DashboardShell';
import { useTenant } from '@/features/tenant';
import { FACULTY_NAV_CONFIG } from './navConfig';

export default function FacultyLayout() {
  const { branding } = useTenant();

  const resolvedConfig = {
    ...FACULTY_NAV_CONFIG,
    accent: branding?.theme_config?.colors?.primary || FACULTY_NAV_CONFIG.accent,
  };

  return <DashboardShell config={resolvedConfig} />;
}
