import { globalApi } from '@/shared/api/client';

/**
 * Fetch portal branding for the current tenant.
 * When domain is omitted, backend resolves tenant from the request host.
 */
export const getPortalBranding = (domain) =>
  globalApi.get('/api/v1/tenants/branding/', {
    params: domain ? { domain } : undefined,
  });

/**
 * Fetch page-specific assets (backgrounds, overlays).
 */
export const getPageAsset = (pageType, domain) =>
  globalApi.get(`/api/v1/tenants/${pageType}/background/`, {
    params: domain ? { domain } : undefined,
  });
