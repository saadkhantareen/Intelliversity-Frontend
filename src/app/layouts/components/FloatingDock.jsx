import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function DockIcon({ item }) {
  const ref = useRef(null);
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);

  const isActive =
    location.pathname === item.href ||
    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

  const IconComponent = item.Icon;

  return (
    <div
      ref={ref}
      className="iv-dock-item-wrapper"
      data-dock-icon
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <NavLink
        to={item.href}
        className={`iv-dock-bubble ${isActive ? 'iv-dock-bubble--active' : ''}`}
        aria-label={item.title}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="iv-dock-icon-svg">
          {IconComponent && <IconComponent s={20} />}
        </span>
        {isActive && <span className="iv-dock-active-glow" />}
      </NavLink>

      {showTooltip && (
        <div className="iv-dock-tooltip" role="tooltip">
          {item.title}
          <div className="iv-dock-tooltip-arrow" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export function FloatingDock({ items = [] }) {
  const containerRef = useRef(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e) => {
    if (reducedMotion || !containerRef.current) return;

    const clientX = e.clientX;
    const bubbles = containerRef.current.querySelectorAll('[data-dock-icon] .iv-dock-bubble');
    const maxDistance = 120;

    bubbles.forEach((bubbleEl) => {
      const rect = bubbleEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const distance = Math.abs(clientX - centerX);

      if (distance < maxDistance) {
        const power = 1 - distance / maxDistance;
        // Smooth sine ease for springy magnification
        const easePower = Math.sin((power * Math.PI) / 2);
        const scale = 1 + easePower * 0.55; // Up to 1.55x
        const translateY = -easePower * 14; // Popping lift up to -14px
        bubbleEl.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      } else {
        bubbleEl.style.transform = 'scale(1) translateY(0px)';
      }
    });
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    const bubbles = containerRef.current.querySelectorAll('[data-dock-icon] .iv-dock-bubble');
    bubbles.forEach((bubbleEl) => {
      bubbleEl.style.transform = 'scale(1) translateY(0px)';
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <>
      {/* Desktop Liquid Glass Floating Dock */}
      <nav
        ref={containerRef}
        className="iv-floating-dock-capsule iv-desktop-dock"
        aria-label="Quick Access Dock"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="iv-dock-glass-track">
          {items.map((item) => (
            <DockIcon
              key={item.href + item.title}
              item={item}
            />
          ))}
        </div>
      </nav>

      {/* Mobile Floating Action Menu */}
      <div className="iv-mobile-dock-wrapper">
        {mobileExpanded && (
          <div
            className="iv-mobile-dock-overlay"
            onClick={() => setMobileExpanded(false)}
            aria-hidden="true"
          />
        )}
        <div className={`iv-mobile-dock-menu ${mobileExpanded ? 'iv-mobile-dock-menu--open' : ''}`}>
          {items.map((item) => {
            const Icon = item.Icon;
            return (
              <NavLink
                key={item.href + item.title}
                to={item.href}
                className={({ isActive }) =>
                  `iv-mobile-dock-item ${isActive ? 'iv-mobile-dock-item--active' : ''}`
                }
                onClick={() => setMobileExpanded(false)}
                title={item.title}
              >
                <span className="iv-mobile-dock-icon">
                  {Icon && <Icon s={18} />}
                </span>
                <span className="iv-mobile-dock-label">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
        <button
          type="button"
          className={`iv-mobile-dock-trigger ${mobileExpanded ? 'iv-mobile-dock-trigger--open' : ''}`}
          onClick={() => setMobileExpanded((prev) => !prev)}
          aria-label={mobileExpanded ? 'Close quick menu' : 'Open quick menu'}
          aria-expanded={mobileExpanded}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: mobileExpanded ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </>
  );
}

export default FloatingDock;
