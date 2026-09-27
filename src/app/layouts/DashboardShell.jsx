import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useTenant } from '@/features/tenant';
import AceternitySidebar from './components/AceternitySidebar';
import Navbar from './components/Navbar';
import FloatingDock from './components/FloatingDock';
import PageTransition from './components/PageTransition';

function initials(name) {
  if (!name) return 'U';
  const p = name.trim().split(' ');
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function DashboardShell({ config }) {
  const { user, logout } = useAuth();
  const { tenant, branding } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [condenseProgress, setCondenseProgress] = useState(0);
  const pageRef = useRef(null);

  const { accent, label, badge, sections = [], primary = [], dock = [] } = config;
  const accentColor = accent || 'var(--brand-primary, #3b82f6)';

  const userName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : 'User';

  const uniLabel = tenant?.university_name || tenant?.university?.name || 'Intelliversity';
  const logoUrl = branding?.logo_url;

  // Sync mobile drawer state with route change
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
  }

  // Close mobile drawer on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Bind shrink header calculation strictly to .iv-page scroll container
  useEffect(() => {
    const pageEl = pageRef.current;
    if (!pageEl) return;

    const handleScroll = () => {
      const scrollTop = pageEl.scrollTop;
      const condenseDistance = 160;
      const progress = Math.min(Math.max(scrollTop / condenseDistance, 0), 1);
      setCondenseProgress(progress);
    };

    pageEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => pageEl.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{css(accentColor)}</style>

      <div className="iv-root" data-portal={config.portal || 'default'}>
        {/* Desktop Aceternity Sidebar */}
        <aside className={`iv-sidebar-pane iv-sidebar-pane--desk ${collapsed ? 'iv-sidebar-pane--col' : ''}`}>
          <AceternitySidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            accentColor={accentColor}
            uniLabel={uniLabel}
            logoUrl={logoUrl}
            badge={badge}
            label={label}
            sections={sections}
            userName={userName}
            onLogout={handleLogout}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </aside>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div
            className="iv-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Aceternity Sidebar Drawer */}
        <aside
          className={`iv-sidebar-pane iv-sidebar-pane--mob ${mobileOpen ? 'iv-sidebar-pane--mob-open' : ''}`}
          aria-hidden={!mobileOpen}
        >
          <AceternitySidebar
            collapsed={false}
            setCollapsed={setCollapsed}
            accentColor={accentColor}
            uniLabel={uniLabel}
            logoUrl={logoUrl}
            badge={badge}
            label={label}
            sections={sections}
            userName={userName}
            onLogout={handleLogout}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </aside>

        {/* Main Column */}
        <div className={`iv-main ${collapsed ? 'iv-main--col' : ''}`}>
          {/* Framer Liquid Glass Navbar with Motion UI Shrink Header */}
          <Navbar
            config={{ portal: config.portal, label, badge, primary, accent: accentColor }}
            condenseProgress={condenseProgress}
            onOpenMobileDrawer={() => setMobileOpen(true)}
            userName={userName}
            uniLabel={uniLabel}
            userInitials={initials(userName)}
            accentColor={accentColor}
          />

          {/* Page Container */}
          <div className="iv-page-wrapper">
            <main ref={pageRef} className="iv-page">
              <PageTransition scrollContainerRef={pageRef}>
                <Outlet />
              </PageTransition>
            </main>
          </div>

          {/* Aceternity Floating Dock with Popping Icons Motion */}
          <FloatingDock items={dock} />
        </div>
      </div>
    </>
  );
}

// ── Scoped Modern UI CSS ──────────────────────────────────────────────────────

const css = (accent) => `
  /* ── Universal Font & Base Tokens ── */
  .iv-root {
    --sb-w: 248px;
    --sb-wc: 68px;
    --bar-h: 54px;
    --bar-tall-h: 76px;

    /* Light Theme (Clean, Crisp, Modern SaaS) */
    --iv-bg: #f8fafc;
    --iv-card-bg: #ffffff;
    --iv-sb-bg: #ffffff;
    --iv-border: rgba(15, 23, 42, 0.08);
    --iv-text: #0f172a;
    --iv-text-secondary: #475569;
    --iv-text-muted: #64748b;
    --iv-accent: ${accent};
    --iv-hover: #f1f5f9;
    --iv-active-bg: color-mix(in srgb, ${accent} 12%, #ffffff);

    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--iv-bg);
    color: var(--iv-text);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    letter-spacing: -0.011em;
  }

  /* ── Dark Theme Overrides (High-Contrast, Rich Obsidian, Luminous Accents) ── */
  .dark .iv-root,
  [data-theme='dark'] .iv-root,
  html.dark .iv-root {
    --iv-bg: #0b0f17;
    --iv-card-bg: #111827;
    --iv-sb-bg: #0f172a;
    --iv-border: rgba(255, 255, 255, 0.09);
    --iv-text: #f8fafc;
    --iv-text-secondary: #cbd5e1;
    --iv-text-muted: #94a3b8;
    --iv-accent: color-mix(in srgb, ${accent} 60%, #60a5fa);
    --iv-hover: rgba(255, 255, 255, 0.07);
    --iv-active-bg: rgba(255, 255, 255, 0.12);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .iv-root {
      --iv-bg: #0b0f17;
      --iv-card-bg: #111827;
      --iv-sb-bg: #0f172a;
      --iv-border: rgba(255, 255, 255, 0.09);
      --iv-text: #f8fafc;
      --iv-text-secondary: #cbd5e1;
      --iv-text-muted: #94a3b8;
      --iv-accent: color-mix(in srgb, ${accent} 60%, #60a5fa);
      --iv-hover: rgba(255, 255, 255, 0.07);
      --iv-active-bg: rgba(255, 255, 255, 0.12);
    }
  }

  /* ── Aceternity Sidebar Shell ── */
  .iv-sidebar-pane {
    flex-shrink: 0;
    width: var(--sb-w);
    height: 100vh;
    background: var(--iv-sb-bg);
    border-right: 1px solid var(--iv-border);
    display: flex;
    flex-direction: column;
    transition: width 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 40;
    overflow: hidden;
  }

  .iv-sidebar-pane--col { width: var(--sb-wc); }

  .iv-sidebar-pane--mob {
    display: none;
    position: fixed;
    top: 0; left: 0;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 4px 0 40px rgba(0, 0, 0, 0.25);
  }
  .iv-sidebar-pane--mob-open { transform: translateX(0); }

  .iv-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    z-index: 39;
  }

  @media (max-width: 1023px) {
    .iv-sidebar-pane--desk { display: none; }
    .iv-sidebar-pane--mob  { display: flex; }
    .iv-overlay           { display: block; }
    .iv-desktop-only      { display: none !important; }
  }
  @media (min-width: 1024px) {
    .iv-mob-only { display: none !important; }
  }

  /* ── Aceternity Sidebar Internal Components ── */
  .iv-aceternity-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: var(--sb-w);
    min-width: var(--sb-w);
    transition: width 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .iv-aceternity-sidebar--collapsed {
    width: var(--sb-wc);
    min-width: var(--sb-wc);
  }

  .iv-asb-header {
    height: var(--bar-h);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px 0 16px;
    border-bottom: 1px solid var(--iv-border);
  }

  .iv-asb-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .iv-asb-logo-wrap {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .iv-asb-logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 3px;
  }

  .iv-asb-logo-initial {
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
  }

  .iv-asb-brand-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .iv-asb-uni-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--iv-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    letter-spacing: -0.02em;
  }

  .iv-asb-portal-badge {
    font-size: 9.5px;
    font-weight: 700;
    padding: 1.5px 6px;
    border-radius: 5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: fit-content;
  }

  .iv-asb-collapse-btn {
    width: 26px;
    height: 26px;
    border: 1px solid var(--iv-border);
    border-radius: 7px;
    background: transparent;
    color: var(--iv-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background 0.15s, color 0.15s;
  }
  .iv-asb-collapse-btn:hover {
    background: var(--iv-hover);
    color: var(--iv-text);
  }

  .iv-asb-collapse-icon {
    display: inline-flex;
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .iv-asb-nav {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px 0;
    scrollbar-width: none;
  }
  .iv-asb-nav::-webkit-scrollbar { display: none; }

  .iv-asb-section { padding: 4px 0; }
  .iv-asb-section + .iv-asb-section {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--iv-border);
  }

  .iv-asb-section-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--iv-text-muted);
    padding: 4px 18px 6px;
    margin: 0;
  }

  .iv-asb-list { list-style: none; margin: 0; padding: 0; }

  .iv-asb-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    height: 38px;
    border-radius: 9px;
    margin: 2px 8px;
    color: var(--iv-text-secondary);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .iv-asb-link:hover {
    background: var(--iv-hover);
    color: var(--iv-text);
  }

  .iv-asb-link--active {
    background: var(--iv-active-bg);
    color: var(--iv-accent);
    font-weight: 600;
  }

  .dark .iv-asb-link--active,
  [data-theme='dark'] .iv-asb-link--active {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .iv-asb-link-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
  }

  .iv-asb-link-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .iv-asb-footer {
    flex-shrink: 0;
    padding: 10px 10px;
    border-top: 1px solid var(--iv-border);
  }

  .iv-asb-footer--collapsed {
    display: flex;
    justify-content: center;
  }

  .iv-asb-user-card {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 8px;
    border-radius: 9px;
    transition: background 0.15s;
  }
  .iv-asb-user-card:hover {
    background: var(--iv-hover);
  }

  .iv-asb-user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .iv-asb-user-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .iv-asb-user-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--iv-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .iv-asb-user-role {
    font-size: 11px;
    color: var(--iv-text-muted);
  }

  .iv-asb-logout-btn {
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    color: var(--iv-text-muted);
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
    padding: 0;
  }
  .iv-asb-logout-btn:hover {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }

  .iv-asb-logout-btn--solo {
    width: 36px;
    height: 36px;
  }

  /* ── Main Column ── */
  .iv-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background: var(--iv-bg);
  }

  /* ── Framer Liquid Glass Navbar with Motion UI Shrink Header ── */
  .iv-navbar-shell {
    flex-shrink: 0;
    width: 100%;
    z-index: 30;
    padding: calc(12px - (var(--condense-progress, 0) * 6px)) 20px;
    transition: padding 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .iv-liquid-glass-navbar {
    position: relative;
    height: calc(var(--bar-tall-h) - (var(--condense-progress, 0) * (var(--bar-tall-h) - var(--bar-h))));
    min-height: var(--bar-h);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    border-radius: 16px;

    /* Light Liquid Glass */
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.45) 100%);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.85);
    box-shadow: 
      0 10px 30px -4px rgba(15, 23, 42, 0.06),
      0 1px 3px rgba(15, 23, 42, 0.04),
      inset 0 1px 1px rgba(255, 255, 255, 0.9);
    transition: height 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s, box-shadow 0.2s;
  }

  /* Dark Liquid Glass */
  .dark .iv-liquid-glass-navbar,
  [data-theme='dark'] .iv-liquid-glass-navbar {
    background: linear-gradient(135deg, rgba(20, 26, 40, 0.82) 0%, rgba(12, 16, 26, 0.65) 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 
      0 12px 36px -4px rgba(0, 0, 0, 0.45),
      inset 0 1px 1px rgba(255, 255, 255, 0.18);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .iv-liquid-glass-navbar {
      background: linear-gradient(135deg, rgba(20, 26, 40, 0.82) 0%, rgba(12, 16, 26, 0.65) 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 
        0 12px 36px -4px rgba(0, 0, 0, 0.45),
        inset 0 1px 1px rgba(255, 255, 255, 0.18);
    }
  }

  /* Specular Highlight along top edge */
  .iv-glass-specular-edge {
    position: absolute;
    top: 0; left: 16px; right: 16px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    pointer-events: none;
  }

  .dark .iv-glass-specular-edge,
  [data-theme='dark'] .iv-glass-specular-edge {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  }

  .iv-navbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .iv-navbar-brand-pill {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .iv-navbar-portal-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 6px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .iv-navbar-uni-title {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--iv-text);
    letter-spacing: -0.02em;
  }

  /* Recessed Liquid Nav Pill Track */
  .iv-navbar-nav-track {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(15, 23, 42, 0.05);
  }

  .dark .iv-navbar-nav-track,
  [data-theme='dark'] .iv-navbar-nav-track {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .iv-liquid-nav-link {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 13px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--iv-text-secondary);
    text-decoration: none;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .iv-liquid-nav-link:hover {
    background: var(--iv-hover);
    color: var(--iv-text);
  }

  /* Luminous Active Pill */
  .iv-liquid-nav-link--active {
    background: #ffffff;
    color: var(--iv-accent);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .dark .iv-liquid-nav-link--active,
  [data-theme='dark'] .iv-liquid-nav-link--active {
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .iv-liquid-nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .iv-navbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .iv-theme-toggle {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--iv-border);
    background: rgba(255, 255, 255, 0.5);
    color: var(--iv-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 0;
  }
  .dark .iv-theme-toggle,
  [data-theme='dark'] .iv-theme-toggle {
    background: rgba(255, 255, 255, 0.06);
  }
  .iv-theme-toggle:hover {
    background: var(--iv-hover);
    transform: rotate(18deg) scale(1.05);
  }

  .iv-navbar-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--iv-border);
    background: rgba(255, 255, 255, 0.5);
    color: var(--iv-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.15s;
    padding: 0;
  }
  .dark .iv-navbar-icon-btn,
  [data-theme='dark'] .iv-navbar-icon-btn {
    background: rgba(255, 255, 255, 0.06);
  }
  .iv-navbar-icon-btn:hover {
    background: var(--iv-hover);
  }

  .iv-notif-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 6px #38bdf8;
  }

  .iv-navbar-divider {
    width: 1px;
    height: 22px;
    background: var(--iv-border);
    margin: 0 4px;
  }

  .iv-navbar-user-block {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .iv-navbar-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  .iv-navbar-user-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .iv-navbar-user-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--iv-text);
  }

  .iv-navbar-user-role {
    font-size: 11px;
    color: var(--iv-text-muted);
  }

  /* ── Page Card and Outer Frame ── */
  .iv-page-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--iv-bg);
    padding: 0 20px 20px 20px;
    overflow: hidden;
  }

  .iv-page {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 28px;
    position: relative;
    background: var(--iv-card-bg);
    border-radius: 16px;
    border: 1px solid var(--iv-border);
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
  }

  /* ── Route Page Transitions ── */
  .iv-page-transition {
    animation: iv-page-fade-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes iv-page-fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── Aceternity Floating Dock with Popping Motion ── */
  .iv-floating-dock-capsule {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    pointer-events: auto;
  }

  .iv-dock-glass-track {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    height: 60px;
    padding: 0 16px 10px 16px;
    border-radius: 9999px;

    /* Light Liquid Glass Capsule */
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.65) 100%);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 
      0 16px 40px -6px rgba(15, 23, 42, 0.12),
      0 4px 12px -2px rgba(15, 23, 42, 0.08),
      inset 0 1px 1px rgba(255, 255, 255, 0.95);
  }

  /* Dark Liquid Glass Capsule */
  .dark .iv-dock-glass-track,
  [data-theme='dark'] .iv-dock-glass-track {
    background: linear-gradient(180deg, rgba(24, 32, 48, 0.88) 0%, rgba(15, 20, 32, 0.75) 100%);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 
      0 20px 45px -6px rgba(0, 0, 0, 0.55),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .iv-dock-glass-track {
      background: linear-gradient(180deg, rgba(24, 32, 48, 0.88) 0%, rgba(15, 20, 32, 0.75) 100%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 
        0 20px 45px -6px rgba(0, 0, 0, 0.55),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
    }
  }

  .iv-dock-item-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Popping Floating Tooltips */
  .iv-dock-tooltip {
    position: absolute;
    top: -42px;
    padding: 5px 10px;
    background: #0f172a;
    color: #ffffff;
    font-size: 11.5px;
    font-weight: 600;
    border-radius: 7px;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    animation: iv-dock-tooltip-pop 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dark .iv-dock-tooltip,
  [data-theme='dark'] .iv-dock-tooltip {
    background: #ffffff;
    color: #0f172a;
  }

  .iv-dock-tooltip-arrow {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #0f172a;
  }
  .dark .iv-dock-tooltip-arrow,
  [data-theme='dark'] .iv-dock-tooltip-arrow {
    border-top-color: #ffffff;
  }

  @keyframes iv-dock-tooltip-pop {
    from { opacity: 0; transform: translateY(6px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Popping Dock Icon Bubble */
  .iv-dock-bubble {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.05);
    color: var(--iv-text);
    text-decoration: none;
    transform-origin: bottom center;
    position: relative;
    transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s, color 0.18s;
  }

  .dark .iv-dock-bubble,
  [data-theme='dark'] .iv-dock-bubble {
    background: rgba(255, 255, 255, 0.08);
    color: #f8fafc;
  }

  .iv-dock-bubble:hover {
    background: var(--iv-hover);
    color: var(--iv-accent);
  }

  .iv-dock-bubble--active {
    background: color-mix(in srgb, var(--iv-accent) 20%, transparent);
    color: var(--iv-accent);
  }

  .iv-dock-active-glow {
    position: absolute;
    bottom: -4px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--iv-accent);
    box-shadow: 0 0 8px var(--iv-accent);
  }

  /* ── Mobile Dock Variant ── */
  .iv-mobile-dock-wrapper { display: none; }

  @media (max-width: 1023px) {
    .iv-desktop-dock { display: none !important; }
    .iv-mobile-dock-wrapper {
      display: block;
      position: fixed;
      bottom: 22px;
      right: 22px;
      z-index: 50;
    }

    .iv-mobile-dock-trigger {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--iv-accent);
      color: #ffffff;
      border: none;
      box-shadow: 0 6px 20px color-mix(in srgb, var(--iv-accent) 45%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .iv-mobile-dock-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 48;
    }

    .iv-mobile-dock-menu {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 190px;
      background: var(--iv-card-bg);
      border-radius: 14px;
      border: 1px solid var(--iv-border);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px) scale(0.95);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 49;
    }

    .iv-mobile-dock-menu--open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .iv-mobile-dock-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--iv-text-secondary);
      text-decoration: none;
      transition: all 0.15s;
    }

    .iv-mobile-dock-item:hover,
    .iv-mobile-dock-item--active {
      background: var(--iv-hover);
      color: var(--iv-accent);
      font-weight: 600;
    }
  }

  /* ── High-Contrast, Crystal-Clear Content Overrides for Dark & Light Mode ── */
  .iv-page h1,
  .iv-page h2,
  .iv-page h3,
  .iv-page h4 {
    color: var(--iv-text) !important;
    font-weight: 700 !important;
    letter-spacing: -0.025em !important;
  }

  .iv-page .text-gray-900,
  .iv-page .text-gray-800,
  .iv-page .text-gray-700 {
    color: var(--iv-text) !important;
  }

  .iv-page .text-gray-600,
  .iv-page .text-gray-500,
  .iv-page .text-gray-400 {
    color: var(--iv-text-muted) !important;
  }

  /* Luminous, readable blue/cyan in dark mode, brand blue in light mode */
  .dark .iv-page .text-blue-600,
  .dark .iv-page .text-blue-700,
  .dark .iv-page .text-indigo-600,
  .dark .iv-page .text-indigo-700,
  [data-theme='dark'] .iv-page .text-blue-600,
  [data-theme='dark'] .iv-page .text-blue-700,
  [data-theme='dark'] .iv-page .text-indigo-600,
  [data-theme='dark'] .iv-page .text-indigo-700 {
    color: #60a5fa !important;
  }

  .iv-page .bg-white {
    background-color: var(--iv-card-bg) !important;
  }

  .iv-page .bg-gray-50 {
    background-color: var(--iv-bg) !important;
  }

  .iv-page .bg-gray-100 {
    background-color: var(--iv-hover) !important;
  }

  .iv-page table {
    color: var(--iv-text) !important;
  }

  .iv-page th {
    color: var(--iv-text-secondary) !important;
    border-bottom: 1px solid var(--iv-border) !important;
    font-weight: 600 !important;
    font-size: 13px !important;
  }

  .iv-page td {
    color: var(--iv-text) !important;
    border-bottom: 1px solid var(--iv-border) !important;
    font-size: 13.5px !important;
  }

  .iv-page tr:hover {
    background-color: var(--iv-hover) !important;
  }

  .iv-page .border,
  .iv-page .border-b,
  .iv-page .border-t,
  .iv-page .border-gray-100,
  .iv-page .border-gray-200,
  .iv-page .border-gray-300 {
    border-color: var(--iv-border) !important;
  }

  /* Buttons */
  .iv-page .bg-blue-600,
  .iv-page .bg-indigo-600 {
    background-color: var(--iv-accent) !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--iv-accent) 30%, transparent) !important;
  }

  .iv-page .hover\\:bg-blue-700:hover,
  .iv-page .hover\\:bg-indigo-700:hover {
    background-color: color-mix(in srgb, var(--iv-accent) 88%, #000000) !important;
  }

  @media (max-width: 640px) {
    .iv-navbar-shell { padding: 10px 12px; }
    .iv-page-wrapper { padding: 0 12px 12px 12px; }
    .iv-page { padding: 16px; border-radius: 12px; }
  }
`;

export default DashboardShell;
