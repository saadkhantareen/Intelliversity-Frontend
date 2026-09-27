import { useTenant } from '@/features/tenant';

/**
 * Convenience hook returning branding values with safe defaults.
 */
export function useBranding() {
  const { branding, brandingLoading } = useTenant();

  const colors = branding?.theme_config?.colors || {};
  const typography = branding?.theme_config?.typography || {};

  return {
    brandingLoading,
    primary: colors.primary || '#1A73E8',
    secondary: colors.secondary || '#FFA000',
    accent: colors.accent || '#00BCD4',
    background: colors.background || '#F5F5F5',
    surface: colors.surface || '#FFFFFF',
    text: colors.text || '#212121',
    textMuted: colors.text_muted || '#757575',
    fontFamily: typography.font_family || 'Inter, sans-serif',
    headingFamily: typography.heading_family || 'Poppins, sans-serif',
    borderRadius: `${branding?.theme_config?.border_radius_px || 8}px`,
    logoUrl: branding?.logo_url || null,
    logoDarkUrl: branding?.logo_dark_url || null,
    faviconUrl: branding?.favicon_url || null,
  };
}
