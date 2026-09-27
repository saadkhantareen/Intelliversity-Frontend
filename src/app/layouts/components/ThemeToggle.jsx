import { useTheme } from '@/shared/theme';
import { IcSun, IcMoon } from '@/shared/components/icons';

export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`iv-theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span className="iv-theme-toggle-icon">
        {isDark ? <IcSun s={17} /> : <IcMoon s={17} />}
      </span>
    </button>
  );
}

export default ThemeToggle;
