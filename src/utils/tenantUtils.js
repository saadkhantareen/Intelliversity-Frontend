// tenantUtils.js
export function applyFavicon(favicon_url) {
  if (!favicon_url) return;

  let link =
    document.querySelector("link[rel~='icon']") ||
    document.createElement("link");

  link.rel = "icon";
  link.href = favicon_url;
  document.head.appendChild(link);
}

export function applyThemeToCSS(theme) {
  if (!theme?.colors) {
    console.warn("applyThemeToCSS: colors missing in theme", theme);
    return;
  }

  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  if (theme.border_radius_px != null) {
    root.style.setProperty("--border-radius", `${theme.border_radius_px}px`);
  }

  if (theme.typography?.font_family) {
    root.style.setProperty("--font-main", theme.typography.font_family);
  }

  if (theme.typography?.heading_family) {
    root.style.setProperty("--font-heading", theme.typography.heading_family);
  }
}