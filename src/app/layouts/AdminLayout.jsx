import DashboardShell from './DashboardShell';
import { useTenant } from '@/features/tenant';
import { ADMIN_NAV_CONFIG } from './navConfig';

export default function AdminLayout() {
  const { branding } = useTenant();

  const resolvedConfig = {
    ...ADMIN_NAV_CONFIG,
    accent: branding?.theme_config?.colors?.primary || ADMIN_NAV_CONFIG.accent,
  };

  return <DashboardShell config={resolvedConfig} />;
}
