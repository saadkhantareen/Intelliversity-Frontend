import DashboardShell from './DashboardShell';
import { useTenant } from '@/features/tenant';
import { STUDENT_NAV_CONFIG } from './navConfig';

export default function StudentLayout() {
  const { branding } = useTenant();

  const resolvedConfig = {
    ...STUDENT_NAV_CONFIG,
    accent: branding?.theme_config?.colors?.primary || STUDENT_NAV_CONFIG.accent,
  };

  return <DashboardShell config={resolvedConfig} />;
}
