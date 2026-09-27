import { useEffect, useState } from 'react';
import { ThemeContext } from './context';

const THEME_STORAGE_KEY = 'iv_theme';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark/light class, data-theme, and sync neutral variables without altering brand hue
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      root.style.setProperty('--color-background', '#0b0f17');
      root.style.setProperty('--color-surface', '#111827');
      root.style.setProperty('--color-text', '#f8fafc');
      root.style.setProperty('--color-text-muted', '#94a3b8');
      root.style.setProperty('--brand-background', '#0b0f17');
      root.style.setProperty('--brand-surface', '#111827');
      root.style.setProperty('--brand-text', '#f8fafc');
      root.style.setProperty('--brand-text-muted', '#94a3b8');
      root.style.setProperty('--brand-sidebar-bg', '#0f172a');
      root.style.setProperty('--brand-topbar-bg', '#0f172a');
      root.style.setProperty('--brand-page-bg', '#0b0f17');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      root.style.setProperty('--color-background', '#f8fafc');
      root.style.setProperty('--color-surface', '#ffffff');
      root.style.setProperty('--color-text', '#0f172a');
      root.style.setProperty('--color-text-muted', '#64748b');
      root.style.setProperty('--brand-background', '#f8fafc');
      root.style.setProperty('--brand-surface', '#ffffff');
      root.style.setProperty('--brand-text', '#0f172a');
      root.style.setProperty('--brand-text-muted', '#64748b');
      root.style.setProperty('--brand-sidebar-bg', '#ffffff');
      root.style.setProperty('--brand-topbar-bg', '#ffffff');
      root.style.setProperty('--brand-page-bg', '#f8fafc');
    }
  }, [isDark]);

  // Listen to OS system theme changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }

    const dark =
      newTheme === 'dark'
        ? true
        : newTheme === 'light'
        ? false
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(dark);
  };

  const toggleTheme = (event) => {
    const nextTheme = isDark ? 'light' : 'dark';

    // Support MagicUI / View Transitions circular reveal animation
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canTransition = typeof document !== 'undefined' && 'startViewTransition' in document && !isReducedMotion;

    if (!canTransition) {
      setTheme(nextTheme);
      return;
    }

    // Get origin coordinates from click event or fallback to top-right
    let x = window.innerWidth - 40;
    let y = 30;

    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (event && event.clientX) {
      x = event.clientX;
      y = event.clientY;
    }

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 350,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
