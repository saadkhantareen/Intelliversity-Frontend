// src/components/layout/DashboardShell.jsx
//
// The ONE component that renders the sidebar + topbar chrome.
// Never used directly in routes — always via a portal-specific layout wrapper
// (StudentLayout, TeacherLayout, AdminLayout) that passes a `config` prop.
//
// config shape:
// {
//   accent:   string,          // hex colour e.g. "#2563eb"
//   portal:   string,          // "student" | "teacher" | "admin"
//   label:    string,          // display name e.g. "Student Portal"
//   badge:    { bg, text },    // badge colours
//   sections: [                // sidebar nav
//     { title: string, items: [{ label, to, Icon }] }
//   ]
// }

import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTenant } from "../../context/TenantContext"
import {
  IcBell, IcSearch, IcMenu, IcChevronLeft, IcLogout,
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
  const { university } = useTenant();
  const navigate = useNavigate();

  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [search, setSearch]           = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const { accent, label, badge, sections } = config;

  const userName = user?.first_name
    ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
    : "User";

  const uniLabel = typeof university === "string"
    ? university
    : university?.name || "";

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [navigate]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── Sidebar content (reused for desktop + mobile drawer) ─────────────────

  const SidebarContent = () => (
    <div className="iv-sb-inner" style={{ "--accent": accent }}>

      {/* Header row */}
      <div className="iv-sb-head">
        <div className="iv-sb-brand">
          <div className="iv-sb-icon" style={{ background: accent }}>
            {uniLabel ? uniLabel[0].toUpperCase() : "I"}
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

      {/* Nav sections */}
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

      {/* Footer: user card */}
      <div className={`iv-sb-foot${collapsed ? " iv-sb-foot--col" : ""}`}>
        <div className="iv-user-row">
          <div
            className="iv-user-av"
            style={{ background: accent + "20", color: accent }}
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
      <style>{css(accent)}</style>

      <div className="iv-root">

        {/* Desktop sidebar */}
        <aside className={`iv-sidebar iv-sidebar--desk${collapsed ? " iv-sidebar--col" : ""}`}>
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="iv-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile drawer */}
        <aside className={`iv-sidebar iv-sidebar--mob${mobileOpen ? " iv-sidebar--mob-open" : ""}`}>
          <SidebarContent />
        </aside>

        {/* Main column */}
        <div className={`iv-main${collapsed ? " iv-main--col" : ""}`}>

          {/* Topbar — same height as sidebar header, shares border line */}
          <header className="iv-topbar" style={{ "--accent": accent }}>
            <div className="iv-topbar-l">
              {/* Hamburger — mobile only */}
              <button
                className="iv-hamburger iv-mob-only"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <IcMenu s={20} />
              </button>

              {/* Search */}
              <div className={`iv-search${searchFocused ? " iv-search--on" : ""}`}>
                <span className="iv-search-ic"><IcSearch s={15} /></span>
                <input
                  ref={searchRef}
                  className="iv-search-inp"
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {search && (
                  <button
                    className="iv-search-clr"
                    onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                  >×</button>
                )}
              </div>
            </div>

            <div className="iv-topbar-r">
              {/* Notification bell */}
              <button className="iv-topbar-btn" aria-label="Notifications">
                <IcBell s={17} />
                <span className="iv-notif-dot" />
              </button>

              <div className="iv-divider" />

              {/* User pill */}
              <div className="iv-topbar-user">
                <div
                  className="iv-topbar-av"
                  style={{ background: accent + "18", color: accent }}
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

          {/* Page content */}
          <main className="iv-page">
            <Outlet />
          </main>
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
    --sb-bg: #ffffff;
    --sb-border: #e5e7eb;
    --sb-text: #6b7280;
    --sb-text-hi: #111827;
    --sb-hover: #f9fafb;
    --sb-active: #f3f4f6;
    --top-bg: #ffffff;
    --top-border: #e5e7eb;
    --page-bg: #f9fafb;
    --accent: ${accent};
    --ease: cubic-bezier(.4,0,.2,1);
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--page-bg);
  }

  /* Dark mode overrides */
  @media (prefers-color-scheme: dark) {
    .iv-root {
      --sb-bg: #111827;
      --sb-border: rgba(255,255,255,0.08);
      --sb-text: #9ca3af;
      --sb-text-hi: #f9fafb;
      --sb-hover: rgba(255,255,255,0.04);
      --sb-active: rgba(255,255,255,0.08);
      --top-bg: #111827;
      --top-border: rgba(255,255,255,0.08);
      --page-bg: #0d1117;
    }
  }

  /* ── Sidebar ── */
  .iv-sidebar {
    flex-shrink: 0;
    width: var(--sb-w);
    height: 100vh;
    background: var(--sb-bg);
    border-right: 1px solid var(--sb-border);
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

  /* ── Sidebar inner (fixed width to prevent reflow during collapse) ── */
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
    border-bottom: 1px solid var(--sb-border);
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
    padding: 6px 0;
    scrollbar-width: none;
  }
  .iv-sb-nav::-webkit-scrollbar { display: none; }
  .iv-sb-section { padding: 2px 0; }
  .iv-sb-section + .iv-sb-section {
    border-top: 1px solid var(--sb-border);
    margin-top: 4px;
    padding-top: 6px;
  }
  .iv-sb-section-title {
    font-size: 10px; font-weight: 600;
    letter-spacing: .7px;
    text-transform: uppercase;
    color: #9ca3af;
    padding: 4px 14px 5px;
    margin: 0;
  }
  .iv-sb-list { list-style: none; margin: 0; padding: 0; }

  .iv-nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 0 10px;
    height: 36px;
    border-radius: 7px;
    margin: 1px 6px;
    color: var(--sb-text);
    text-decoration: none;
    font-size: 13px; font-weight: 450;
    white-space: nowrap; overflow: hidden;
    transition: background .14s, color .14s;
    position: relative;
  }
  .iv-nav-item:hover {
    background: var(--sb-hover);
    color: var(--sb-text-hi);
  }
  .iv-nav-item--active {
    background: var(--sb-active);
    color: var(--sb-text-hi);
    font-weight: 500;
  }
  .iv-nav-item--active::before {
    content: "";
    position: absolute;
    left: 0; top: 7px; bottom: 7px;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: var(--accent);
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
  .iv-logout:hover { background: #fef2f2; color: #ef4444; }
  @media (prefers-color-scheme: dark) {
    .iv-logout:hover { background: rgba(239,68,68,.12); color: #f87171; }
  }
  .iv-logout--solo { width: 34px; height: 34px; }

  /* ── Main column ── */
  .iv-main {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  /* ── Topbar ──
     Same height as iv-sb-head. Shares the same border-bottom line,
     creating the seamless blended effect. */
  .iv-topbar {
    height: var(--bar-h);
    flex-shrink: 0;
    background: var(--top-bg);
    border-bottom: 1px solid var(--top-border);
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 16px 0 18px;
    gap: 10px;
  }
  .iv-topbar-l {
    display: flex; align-items: center; gap: 8px;
    flex: 1; min-width: 0;
  }
  .iv-hamburger {
    flex-shrink: 0;
    width: 34px; height: 34px;
    background: transparent; border: none;
    color: #6b7280; cursor: pointer;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    padding: 0;
    transition: background .14s;
  }
  .iv-hamburger:hover { background: #f3f4f6; }

  /* Search */
  .iv-search {
    display: flex; align-items: center; gap: 7px;
    background: #f3f4f6;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0 10px;
    height: 34px;
    width: 100%; max-width: 340px;
    transition: border-color .16s, background .16s, box-shadow .16s;
  }
  .iv-search--on {
    background: #fff;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
  }
  @media (prefers-color-scheme: dark) {
    .iv-search { background: rgba(255,255,255,.06); }
    .iv-search--on { background: rgba(255,255,255,.09); }
  }
  .iv-search-ic { color: #9ca3af; display: flex; align-items: center; flex-shrink: 0; }
  .iv-search--on .iv-search-ic { color: var(--accent); }
  .iv-search-inp {
    flex: 1; background: transparent; border: none; outline: none;
    font-size: 13px; color: #111827; padding: 0;
  }
  @media (prefers-color-scheme: dark) {
    .iv-search-inp { color: #f9fafb; }
    .iv-search-inp::placeholder { color: #6b7280; }
  }
  .iv-search-inp::placeholder { color: #9ca3af; }
  .iv-search-clr {
    background: none; border: none; color: #9ca3af;
    cursor: pointer; font-size: 15px; line-height: 1;
    padding: 0; width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    transition: background .14s;
  }
  .iv-search-clr:hover { background: #e5e7eb; }

  /* Topbar right */
  .iv-topbar-r {
    display: flex; align-items: center; gap: 3px;
    flex-shrink: 0;
  }
  .iv-topbar-btn {
    width: 34px; height: 34px;
    background: transparent; border: none;
    color: #6b7280; cursor: pointer;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    transition: background .14s;
    padding: 0;
  }
  .iv-topbar-btn:hover { background: #f3f4f6; }
  @media (prefers-color-scheme: dark) {
    .iv-topbar-btn:hover { background: rgba(255,255,255,.06); }
    .iv-hamburger:hover  { background: rgba(255,255,255,.06); }
  }
  .iv-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #ef4444;
    border: 2px solid var(--top-bg);
  }
  .iv-divider {
    width: 1px; height: 20px;
    background: var(--top-border);
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
    color: #111827; white-space: nowrap;
  }
  .iv-topbar-urole {
    font-size: 11px; color: #9ca3af;
    white-space: nowrap; text-transform: capitalize;
  }
  @media (prefers-color-scheme: dark) {
    .iv-topbar-uname { color: #f9fafb; }
  }

  /* ── Page content ── */
  .iv-page {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
  }
  @media (max-width: 640px) {
    .iv-page { padding: 16px; }
    .iv-search { max-width: 180px; }
  }
`;

export default DashboardShell;