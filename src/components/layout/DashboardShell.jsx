// src/components/layout/DashboardShell.jsx
import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTenant } from "../../context/TenantContext";
import {
  IcBell, IcMenu, IcChevronLeft, IcLogout,
} from "./icons";

// ── Helpers ──────────────────────────────────────────────────────────────────

function initials(name) {
  if (!name) return "U";
  const p = name.trim().split(" ");
  return p.length === 1
    ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export function DashboardShell({ config }) {
  const { user, logout } = useAuth();
  const { tenant, branding } = useTenant();
  const navigate = useNavigate();

  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const { accent, label, badge, sections } = config;
  const accentColor = accent || "var(--brand-primary)";

  const userName = user?.first_name
    ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
    : "User";

  const uniLabel =
    tenant?.university_name || tenant?.university?.name || "Intelliversity";
  const logoUrl = branding?.logo_url;

  useEffect(() => { setMobileOpen(false); }, [navigate]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── Sidebar content (reused for desktop + mobile drawer) ─────────────────

  const SidebarContent = () => (
    <div className="iv-sb-inner" style={{ "--accent": accentColor }}>
      <div className="iv-sb-head">
        <div className="iv-sb-brand">
          <div className="iv-sb-icon" style={{ background: accentColor }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${uniLabel} logo`}
                className="iv-sb-logo"
              />
            ) : (
              (uniLabel || "I")[0].toUpperCase()
            )}
          </div>
          {!collapsed && (
            <div className="iv-sb-brandtext">
              <span className="iv-sb-uni">{uniLabel || "Intelliversity"}</span>
              <span className="iv-sb-badge" style={{ background: badge.bg, color: badge.text }}>
                {label}
              </span>
            </div>
          )}
        </div>
        <button
          className="iv-sb-collapse iv-desktop-only"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          <span style={{
            display: "inline-flex",
            transform: collapsed ? "rotate(180deg)" : "none",
            transition: "transform .22s",
          }}>
            <IcChevronLeft s={15} />
          </span>
        </button>
      </div>

      <nav className="iv-sb-nav">
        {sections.map((section) => (
          <div className="iv-sb-section" key={section.title}>
            {!collapsed && (
              <p className="iv-sb-section-title">{section.title}</p>
            )}
            <ul className="iv-sb-list">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      "iv-nav-item" + (isActive ? " iv-nav-item--active" : "")
                    }
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="iv-nav-icon"><item.Icon s={17} /></span>
                    {!collapsed && <span className="iv-nav-label">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`iv-sb-foot${collapsed ? " iv-sb-foot--col" : ""}`}>
        <div className="iv-user-row">
          <div
            className="iv-user-av"
            style={{ background: accentColor + "20", color: accentColor }}
          >
            {initials(userName)}
          </div>
          {!collapsed && (
            <div className="iv-user-info">
              <span className="iv-user-name">{userName}</span>
              <span className="iv-user-role">{label}</span>
            </div>
          )}
          {!collapsed && (
            <button className="iv-logout" onClick={handleLogout} title="Sign out">
              <IcLogout s={15} />
            </button>
          )}
        </div>
        {collapsed && (
          <button className="iv-logout iv-logout--solo" onClick={handleLogout} title="Sign out">
            <IcLogout s={15} />
          </button>
        )}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{css(accentColor)}</style>

      <div className="iv-root" data-portal={config.portal || "default"}>
        <aside className={`iv-sidebar iv-sidebar--desk${collapsed ? " iv-sidebar--col" : ""}`}>
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div
            className="iv-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside className={`iv-sidebar iv-sidebar--mob${mobileOpen ? " iv-sidebar--mob-open" : ""}`}>
          <SidebarContent />
        </aside>

        <div className={`iv-main${collapsed ? " iv-main--col" : ""}`}>
          <header className="iv-topbar" style={{ "--accent": accentColor }}>
            <div className="iv-topbar-l">
              <button
                className="iv-hamburger iv-mob-only"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <IcMenu s={20} />
              </button>
            </div>

            <div className="iv-topbar-r">
              <button className="iv-topbar-btn" aria-label="Notifications">
                <IcBell s={17} />
                <span className="iv-notif-dot" />
              </button>

              <div className="iv-divider" />

              <div className="iv-topbar-user">
                <div
                  className="iv-topbar-av"
                  style={{ background: accentColor + "18", color: accentColor }}
                >
                  {initials(userName)}
                </div>
                <div className="iv-topbar-uinfo iv-desktop-only">
                  <span className="iv-topbar-uname">{userName}</span>
                  <span className="iv-topbar-urole">{uniLabel || label}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="iv-page-wrapper">
            <main className="iv-page">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Scoped CSS ────────────────────────────────────────────────────────────────

const css = (accent) => `
  .iv-root {
    --sb-w: 232px;
    --sb-wc: 60px;
    --bar-h: 54px;

    /* Sidebar + Topbar = warm off-white */
    --shell-bg: var(--brand-background);
    --sb-bg: var(--brand-sidebar-bg, var(--brand-surface));
    --top-bg: var(--brand-topbar-bg, var(--brand-surface));

    /* Page content = clean white */
    --page-bg: var(--brand-page-bg, var(--brand-background));

    --sb-border: color-mix(in srgb, var(--brand-text) 12%, transparent);
    --sb-text: color-mix(in srgb, var(--brand-surface) 72%, var(--brand-text));
    --sb-text-hi: var(--brand-surface);
    --sb-hover: color-mix(in srgb, var(--brand-surface) 12%, transparent);
    --sb-active-bg: color-mix(in srgb, var(--brand-accent) 22%, transparent);
    --sb-active-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 0.5px 1px rgba(0,0,0,0.04);
    --top-border: color-mix(in srgb, var(--brand-text) 10%, transparent);
    --accent: ${accent};
    --ease: cubic-bezier(.4,0,.2,1);
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--shell-bg);
    font-family: var(--brand-font);
  }

  .iv-root h1,
  .iv-root h2,
  .iv-root h3,
  .iv-root h4,
  .iv-root h5,
  .iv-root h6 {
    font-family: var(--brand-font-heading);
  }


  /* ── Dark mode ── */
  @media (prefers-color-scheme: dark) {
    .iv-root {
      --shell-bg: #1a1d24;
      --sb-bg: #1a1d24;
      --top-bg: #1a1d24;
      --page-bg: #0d1117;
      --sb-border: rgba(255,255,255,0.06);
      --sb-text: #9ca3af;
      --sb-text-hi: #f9fafb;
      --sb-hover: rgba(255,255,255,0.045);
      --sb-active-bg: rgba(255,255,255,0.09);
      --sb-active-shadow: 0 1px 3px rgba(0,0,0,0.3);
      --top-border: rgba(255,255,255,0.06);
    }
  }

  /* ── Sidebar ── */
  .iv-sidebar {
    flex-shrink: 0;
    width: var(--sb-w);
    height: 100vh;
    background: var(--sb-bg);
    border-right: none;
    display: flex;
    flex-direction: column;
    transition: width .22s var(--ease);
    overflow: hidden;
    z-index: 40;
  }
  .iv-sidebar--col { width: var(--sb-wc); }
  .iv-sidebar--mob {
    display: none;
    position: fixed;
    top: 0; left: 0;
    transform: translateX(-100%);
    transition: transform .22s var(--ease);
    box-shadow: 4px 0 32px rgba(0,0,0,.12);
  }
  .iv-sidebar--mob-open { transform: translateX(0); }
  .iv-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.35);
    z-index: 39;
  }

  @media (max-width: 768px) {
    .iv-sidebar--desk { display: none; }
    .iv-sidebar--mob  { display: flex; }
    .iv-overlay       { display: block; }
    .iv-desktop-only  { display: none !important; }
  }
  @media (min-width: 769px) {
    .iv-mob-only { display: none !important; }
  }

  /* ── Sidebar inner ── */
  .iv-sb-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: var(--sb-w);
    min-width: var(--sb-w);
  }
  .iv-sidebar--col .iv-sb-inner {
    width: var(--sb-wc);
    min-width: var(--sb-wc);
  }

  /* ── Sidebar header ── */
  .iv-sb-head {
    height: var(--bar-h);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 0 14px;
    border-bottom: none;
    background: var(--sb-bg);
  }
  .iv-sb-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    overflow: hidden;
  }
  .iv-sb-icon {
    flex-shrink: 0;
    width: 30px; height: 30px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: #fff;
  }
  .iv-sb-logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
  }
  .iv-sb-brandtext {
    display: flex; flex-direction: column; gap: 2px;
    min-width: 0;
  }
  .iv-sb-uni {
    font-size: 12.5px; font-weight: 600;
    color: var(--sb-text-hi);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 118px;
    text-transform: capitalize;
  }
  .iv-sb-badge {
    font-size: 10px; font-weight: 600;
    padding: 1px 6px;
    border-radius: 4px;
    letter-spacing: .3px;
    text-transform: uppercase;
    width: fit-content;
  }
  .iv-sb-collapse {
    flex-shrink: 0;
    width: 24px; height: 24px;
    border: 1px solid var(--sb-border);
    border-radius: 5px;
    background: transparent;
    color: var(--sb-text);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    transition: background .15s, color .15s;
  }
  .iv-sb-collapse:hover { background: var(--sb-hover); color: var(--sb-text-hi); }

  /* ── Nav ── */
  .iv-sb-nav {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px 0;
    scrollbar-width: none;
  }
  .iv-sb-nav::-webkit-scrollbar { display: none; }
  .iv-sb-section { padding: 2px 0; }
  .iv-sb-section + .iv-sb-section {
    margin-top: 6px;
    padding-top: 6px;
  }
  .iv-sb-section-title {
    font-size: 10px; font-weight: 600;
    letter-spacing: .7px;
    text-transform: uppercase;
    color: var(--sb-text);
    padding: 4px 14px 5px;
    margin: 0;
  }
  @media (prefers-color-scheme: dark) {
    .iv-sb-section-title { color: #6b7280; }
  }
  .iv-sb-list { list-style: none; margin: 0; padding: 0; }

  .iv-nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 0 10px;
    height: 36px;
    border-radius: 8px;
    margin: 2px 6px;
    color: var(--sb-text);
    text-decoration: none;
    font-size: 13px; font-weight: 450;
    white-space: nowrap; overflow: hidden;
    transition: background .14s, color .14s, box-shadow .14s;
    position: relative;
  }
  .iv-nav-item:hover {
    background: var(--sb-hover);
    color: var(--sb-text-hi);
  }
  .iv-nav-item--active {
    background: var(--sb-active-bg);
    box-shadow: var(--sb-active-shadow);
    color: var(--sb-text-hi);
    font-weight: 550;
  }
  .iv-nav-item--active::before {
    content: none;
  }
  .iv-nav-icon {
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    width: 19px; height: 19px;
  }
  .iv-nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

  /* ── Sidebar footer ── */
  .iv-sb-foot {
    flex-shrink: 0;
    padding: 8px 6px;
    border-top: 1px solid var(--sb-border);
  }
  .iv-sb-foot--col { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .iv-user-row {
    display: flex; align-items: center; gap: 7px;
    padding: 5px 6px;
    border-radius: 7px;
    transition: background .14s;
  }
  .iv-user-row:hover { background: var(--sb-hover); }
  .iv-user-av {
    flex-shrink: 0;
    width: 30px; height: 30px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
  }
  .iv-user-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .iv-user-name {
    font-size: 12.5px; font-weight: 500;
    color: var(--sb-text-hi);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .iv-user-role { font-size: 11px; color: var(--sb-text); }
  .iv-logout {
    flex-shrink: 0;
    width: 26px; height: 26px;
    background: transparent; border: none;
    color: var(--sb-text);
    cursor: pointer;
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    transition: background .14s, color .14s;
    padding: 0;
  }
  .iv-logout:hover {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }
  @media (prefers-color-scheme: dark) {
    .iv-logout:hover { background: rgba(239,68,68,.12); color: #f87171; }
  }
  .iv-logout--solo { width: 34px; height: 34px; }

  /* ── Main column ── */
  .iv-main {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
    overflow: hidden;
    background: var(--shell-bg);
  }

  /* ── Topbar ── blended with sidebar, same off-white */
  .iv-topbar {
    height: var(--bar-h);
    flex-shrink: 0;
    background: var(--top-bg);
    border-bottom: none;
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 16px 0 18px;
    gap: 10px;
    z-index: 10;
  }
  .iv-topbar-l {
    display: flex; align-items: center; gap: 8px;
    flex: 1; min-width: 0;
  }
  .iv-hamburger {
    flex-shrink: 0;
    width: 34px; height: 34px;
    background: transparent; border: none;
    color: var(--sb-text); cursor: pointer;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    transition: background .14s;
  }
  .iv-hamburger:hover { background: var(--sb-hover); }

  /* Search */
  /* Search removed */

  /* Topbar right */
  .iv-topbar-r {
    display: flex; align-items: center; gap: 3px;
    flex-shrink: 0;
  }
  .iv-topbar-btn {
    width: 34px; height: 34px;
    background: transparent; border: none;
    color: var(--sb-text); cursor: pointer;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    transition: background .14s;
    padding: 0;
  }
  .iv-topbar-btn:hover { background: var(--sb-hover); }
  @media (prefers-color-scheme: dark) {
    .iv-topbar-btn:hover { background: rgba(255,255,255,.06); }
    .iv-hamburger:hover  { background: rgba(255,255,255,.06); }
  }
  .iv-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--brand-accent);
    border: 2px solid var(--top-bg);
  }
  .iv-divider {
    width: 1px; height: 20px;
    background: var(--sb-border);
    margin: 0 3px;
  }
  .iv-topbar-user {
    display: flex; align-items: center; gap: 7px;
    padding: 3px 4px;
    border-radius: 7px;
  }
  .iv-topbar-av {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
  }
  .iv-topbar-uinfo { display: flex; flex-direction: column; gap: 1px; }
  .iv-topbar-uname {
    font-size: 12.5px; font-weight: 500;
    color: var(--sb-text-hi); white-space: nowrap;
  }
  .iv-topbar-urole {
    font-size: 11px; color: var(--sb-text);
    white-space: nowrap; text-transform: capitalize;
  }

  /* ── Page wrapper (parent with shell background as margin color) ── */
  .iv-page-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--shell-bg);
    padding: 16px;
    overflow: hidden;
  }

/* ── Page content — Floating Card Style ── */
  .iv-page {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
    position: relative;
    isolation: isolate;
    background: var(--page-bg);
    
    /* Rounded corners - parent background creates the margin effect */
    border-radius: 16px 0 0 16px;
    
    /* Subtle shadow to lift it off the background */
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .iv-page > * {
    position: relative;
    z-index: 1;
  }

  /* ── Brand overrides for inner content ── */
  .iv-page .bg-white { 
    background-color: var(--brand-surface) !important;
  }
  .iv-page .bg-gray-50 { 
    background-color: var(--brand-page-bg) !important;
  }
  .iv-page .bg-gray-100 {
    background-color: color-mix(in srgb, var(--brand-text) 6%, transparent) !important;
  }
  .iv-page .border-gray-100,
  .iv-page .border-gray-200,
  .iv-page .border-gray-300 {
    border-color: var(--sb-border) !important;
  }
  .iv-page .text-gray-900,
  .iv-page .text-gray-800,
  .iv-page .text-gray-700 {
    color: var(--brand-text) !important;
  }
  .iv-page .text-gray-600,
  .iv-page .text-gray-500,
  .iv-page .text-gray-400 {
    color: var(--brand-text-muted) !important;
  }
  .iv-page .bg-blue-600,
  .iv-page .bg-indigo-600,
  .iv-page .bg-green-600 {
    background-color: var(--brand-primary) !important;
  }
  .iv-page .hover\:bg-blue-700:hover,
  .iv-page .hover\:bg-indigo-700:hover,
  .iv-page .hover\:bg-green-700:hover {
    background-color: color-mix(in srgb, var(--brand-primary) 88%, var(--brand-secondary)) !important;
  }
  .iv-page .text-blue-700,
  .iv-page .text-blue-600,
  .iv-page .text-indigo-600,
  .iv-page .text-green-600 {
    color: var(--brand-primary) !important;
  }
  .iv-page .text-red-500,
  .iv-page .text-red-600,
  .iv-page .text-red-700 {
    color: var(--brand-danger) !important;
  }
  .iv-page .bg-blue-100,
  .iv-page .bg-indigo-50,
  .iv-page .bg-indigo-100,
  .iv-page .bg-green-100,
  .iv-page .bg-amber-100,
  .iv-page .bg-purple-100 {
    background-color: color-mix(in srgb, var(--brand-accent) 18%, transparent) !important;
  }
  .iv-page .bg-red-100 {
    background-color: color-mix(in srgb, var(--brand-danger) 18%, transparent) !important;
  }
  .iv-page .text-indigo-700,
  .iv-page .text-amber-600,
  .iv-page .text-amber-700,
  .iv-page .text-purple-600 {
    color: var(--brand-accent) !important;
  }

  .iv-page tr {
    border-bottom: 1px solid var(--sb-border) !important;
  }

  .iv-page th {
    border-bottom: 2px solid var(--sb-border) !important;
  }

  /* Remove inner borders in Documents section (keep card border) */
  .iv-page .doc-section input,
  .iv-page .doc-section select,
  .iv-page .doc-section textarea,
  .iv-page .doc-section button,
  .iv-page .doc-section [role="button"],
  .iv-page .doc-section .border {
    border: none !important;
  }

  /* Form controls and buttons */
  .iv-page input,
  .iv-page select,
  .iv-page textarea,
  .iv-page button,
  .iv-page [role="button"] {
    border: 1px solid var(--sb-border) !important;
  }

  @media (max-width: 640px) {
    .iv-page-wrapper { padding: 12px; }
    .iv-page { 
      padding: 16px; 
      border-radius: 12px; 
    }
  }
`;

export default DashboardShell;