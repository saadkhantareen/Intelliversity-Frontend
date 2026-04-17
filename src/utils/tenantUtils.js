export function applyFavicon(favicon_url) {
  if (favicon_url) {
    let link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");

    link.rel = "icon";
    link.href = favicon_url;

    document.head.appendChild(link);
  }
}

export function applyThemeToCSS(theme) {
  const root = document.documentElement;

  const colors = theme.colors;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  root.style.setProperty("--border-radius", `${theme.border_radius_px}px`);

  if (theme.typography?.font_family) {
    root.style.setProperty("--font-main", theme.typography.font_family);
  }

  if (theme.typography?.heading_family) {
    root.style.setProperty("--font-heading", theme.typography.heading_family);
  }
}
