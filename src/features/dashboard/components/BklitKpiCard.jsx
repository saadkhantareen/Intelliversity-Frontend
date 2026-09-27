import NumberFlow from '@number-flow/react';
import BklitSparkline from './BklitSparkline';

export function BklitKpiCard({
  title,
  value,
  delta,
  deltaLabel = 'vs last term',
  isPositive = true,
  sparkData = [],
  color = '#38bdf8',
  icon: Icon,
  badgeText,
  format = {},
}) {
  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        backgroundColor: 'var(--brand-surface, #ffffff)',
        borderColor: 'var(--iv-border, rgba(15, 23, 42, 0.08))',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Subtle top specular edge highlight on hover */}
      <div
        className="pointer-events-none absolute -top-px left-6 right-6 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                color: color,
              }}
            >
              <Icon s={18} />
            </div>
          )}
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--brand-text-muted, #64748b)' }}
            >
              {title}
            </span>
            {badgeText && (
              <span
                className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  color: color,
                }}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {/* Delta Pill (+12.4% vs last month) */}
        {delta !== undefined && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: isPositive
                ? 'color-mix(in srgb, #10b981 12%, transparent)'
                : 'color-mix(in srgb, #ef4444 12%, transparent)',
              color: isPositive ? '#10b981' : '#ef4444',
            }}
          >
            <svg
              className={`h-3 w-3 transition-transform ${isPositive ? '' : 'rotate-180'}`}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2 7 6 3 10 7" />
            </svg>
            <span>{delta}</span>
          </div>
        )}
      </div>

      {/* Main Metric Value with Rolling NumberFlow Animation */}
      <div className="my-1 flex items-baseline justify-between gap-2">
        <div
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--brand-text, #0f172a)' }}
        >
          <NumberFlow
            value={value}
            format={format}
            transformTiming={{ duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </div>

        {/* Subtitle / Delta baseline note */}
        <span
          className="text-[11.5px] font-medium"
          style={{ color: 'var(--brand-text-muted, #94a3b8)' }}
        >
          {deltaLabel}
        </span>
      </div>

      {/* Sparkline Canvas Area */}
      <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--iv-border, rgba(15, 23, 42, 0.05))' }}>
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-medium tracking-wide uppercase" style={{ color: 'var(--brand-text-muted, #94a3b8)' }}>
            Pulse Trend
          </span>
          <BklitSparkline
            data={sparkData}
            width={124}
            height={34}
            color={color}
            showPulse={true}
          />
        </div>
      </div>
    </div>
  );
}

export default BklitKpiCard;
