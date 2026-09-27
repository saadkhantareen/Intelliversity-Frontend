import { NavLink } from 'react-router-dom';
import { IcLogout } from '@/shared/components/icons';

function initials(name) {
  if (!name) return 'U';
  const p = name.trim().split(' ');
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function AceternitySidebar({
  collapsed,
  accentColor,
  uniLabel,
  logoUrl,
  badge,
  label,
  sections = [],
  userName,
  onLogout,
  onCloseMobile,
}) {
  return (
    <div className={`iv-aceternity-sidebar ${collapsed ? 'iv-aceternity-sidebar--collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="iv-asb-header">
        <div className="iv-asb-brand">
          <div className="iv-asb-logo-wrap" style={{ background: accentColor }}>
            {logoUrl ? (
              <img src={logoUrl} alt={`${uniLabel} logo`} className="iv-asb-logo-img" />
            ) : (
              <span className="iv-asb-logo-initial">{(uniLabel || 'I')[0].toUpperCase()}</span>
            )}
          </div>
          {!collapsed && (
            <div className="iv-asb-brand-text">
              <span className="iv-asb-uni-name">{uniLabel || 'Intelliversity'}</span>
              <span
                className="iv-asb-portal-badge"
                style={{ background: badge?.bg || accentColor, color: badge?.text || '#ffffff' }}
              >
                {label}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Navigation Sections */}
      <nav className="iv-asb-nav" aria-label="Sidebar Navigation">
        {sections.map((section) => (
          <div className="iv-asb-section" key={section.title}>
            {!collapsed && <p className="iv-asb-section-title">{section.title}</p>}
            <ul className="iv-asb-list">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `iv-asb-link ${isActive ? 'iv-asb-link--active' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                    onClick={onCloseMobile}
                  >
                    <span className="iv-asb-link-icon">
                      <item.Icon s={18} />
                    </span>
                    {!collapsed && <span className="iv-asb-link-label">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`iv-asb-footer ${collapsed ? 'iv-asb-footer--collapsed' : ''}`}>
        <div className="iv-asb-user-card">
          <div
            className="iv-asb-user-avatar"
            style={{
              background: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
              color: accentColor,
            }}
          >
            {initials(userName)}
          </div>
          {!collapsed && (
            <div className="iv-asb-user-meta">
              <span className="iv-asb-user-name">{userName}</span>
              <span className="iv-asb-user-role">{label}</span>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              className="iv-asb-logout-btn"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <IcLogout s={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            className="iv-asb-logout-btn iv-asb-logout-btn--solo"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <IcLogout s={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default AceternitySidebar;
