import { useEffect } from "react";
import { useTenant } from "@/context/TenantContext";
import { applyFavicon } from "@/utils/tenantUtils";

function extractFontName(value) {
  return value ? value.split(",")[0].trim() : null;
}

/**
 * Handles favicon injection and dynamic font loading when branding changes.
 */
export function useBrandingEffects() {
  const { branding } = useTenant();

  useEffect(() => {
    if (branding?.favicon_url) {
      applyFavicon(branding.favicon_url);
    }
  }, [branding?.favicon_url]);

  useEffect(() => {
    const fontFamily = extractFontName(
      branding?.theme_config?.typography?.font_family,
    );
    const headingFamily = extractFontName(
      branding?.theme_config?.typography?.heading_family,
    );

    const fonts = [fontFamily, headingFamily]
      .filter(Boolean)
      .filter((font) => !["sans-serif", "serif", "monospace"].includes(font));

    if (fonts.length === 0) return;

    document
      .querySelectorAll("link[data-dynamic-font]")
      .forEach((el) => el.remove());

    const uniqueFonts = [...new Set(fonts)];
    const query = uniqueFonts
      .map((font) => `family=${font.replace(/ /g, "+")}:wght@300;400;500;600;700`)
      .join("&");

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute("data-dynamic-font", "true");
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    document.head.appendChild(link);
  }, [branding?.theme_config?.typography]);
}
