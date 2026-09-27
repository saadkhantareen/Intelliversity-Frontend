import { NavLink } from 'react-router-dom';
import { IcBell, IcMenu } from '@/shared/components/icons';
import ThemeToggle from './ThemeToggle';

export function Navbar({
  config,
  condenseProgress = 0,
  onOpenMobileDrawer,
  userName = 'User',
  uniLabel = 'Intelliversity',
  userInitials = 'U',
  accentColor = 'var(--brand-primary)',
}) {
  const { primary = [], label = 'Portal', badge } = config;

  return (
    <header
      className="iv-navbar-shell"
      style={{
        '--condense-progress': condenseProgress,
        '--accent': accentColor,
      }}
    >
      <div className="iv-liquid-glass-navbar">
        {/* Specular top reflection line for liquid glass */}
        <div className="iv-glass-specular-edge" aria-hidden="true" />

        {/* Left: Mobile Drawer Trigger + Brand / Portal Badge */}
        <div className="iv-navbar-left">
          <button
            type="button"
            className="iv-hamburger iv-mob-only"
            onClick={onOpenMobileDrawer}
            aria-label="Open menu"
          >
            <IcMenu s={20} />
          </button>

          <div className="iv-navbar-brand-pill">
            <span
              className="iv-navbar-portal-badge"
              style={{ background: badge?.bg || accentColor, color: badge?.text || '#ffffff' }}
            >
              {label}
            </span>
            <span className="iv-navbar-uni-title">{uniLabel}</span>
          </div>
        </div>

        {/* Center: Liquid Glass Nav Pills */}
        <nav className="iv-navbar-nav-track iv-desktop-only" aria-label="Primary navigation">
          {primary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `iv-liquid-nav-link ${isActive ? 'iv-liquid-nav-link--active' : ''}`
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              <span className="iv-liquid-nav-icon">
                <item.Icon s={16} />
              </span>
              <span className="iv-liquid-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right: Theme Toggle + Notifications + User Avatar */}
        <div className="iv-navbar-right">
          <ThemeToggle />

          <button
            type="button"
            className="iv-navbar-icon-btn"
            aria-label="Notifications"
            title="Notifications"
          >
            <IcBell s={17} />
            <span className="iv-notif-dot" />
          </button>

          <div className="iv-navbar-divider" />

          <div className="iv-navbar-user-block">
            <div
              className="iv-navbar-avatar"
              style={{
                background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                color: accentColor,
              }}
            >
              {userInitials}
            </div>
            <div className="iv-navbar-user-text iv-desktop-only">
              <span className="iv-navbar-user-name">{userName}</span>
              <span className="iv-navbar-user-role">{label}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
