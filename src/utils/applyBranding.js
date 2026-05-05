import { applyThemeToCSS } from "./tenantUtils";

/**
 * Writes branding values as CSS custom properties on :root.
 * Uses existing theme application so legacy vars stay in sync.
 */
export function applyBrandingToCSSVariables(themeConfig) {
  if (!themeConfig) return;
  applyThemeToCSS(themeConfig);
}
