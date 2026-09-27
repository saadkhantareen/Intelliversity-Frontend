import { useState, useRef, useId } from 'react';
import NumberFlow from '@number-flow/react';

function createAreaSpline(points, width, height, padX = 24, padY = 30) {
  if (!points || points.length === 0) {
    return { path: '', areaPath: '', pts: [] };
  }
  const min = Math.min(...points.map((p) => p.value));
  const max = Math.max(...points.map((p) => p.value));
  const range = max - min || 1;
  const w = width - padX * 2;
  const h = height - padY * 2;

  const pts = points.map((item, idx) => {
    const x = padX + (idx / (points.length - 1)) * w;
    const y = padY + h - ((item.value - min) / range) * h;
    return { ...item, x, y, origValue: item.value };
  });

  if (pts.length === 1) {
    return {
      path: `M ${pts[0].x} ${pts[0].y}`,
      areaPath: `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${height - padY} L ${pts[0].x} ${height - padY} Z`,
      pts,
    };
  }

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const last = pts[pts.length - 1];
  const first = pts[0];
  const areaPath = `${path} L ${last.x} ${height - padY + 10} L ${first.x} ${height - padY + 10} Z`;

  return { path, areaPath, pts };
}

export function BklitAreaChart({
  title = 'Enrollment & Admission Velocity',
  subtitle = 'Monthly matriculation count across active programs',
  data = [],
  periods = ['6M', '1Y', 'All'],
  activePeriod = '6M',
  onPeriodChange,
  color = '#38bdf8',
  secondaryColor = '#818cf8',
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '');

  const svgWidth = 600;
  const svgHeight = 220;
  const { path, areaPath, pts } = createAreaSpline(data, svgWidth, svgHeight, 30, 24);

  const activePoint = hoverIndex !== null && pts[hoverIndex] ? pts[hoverIndex] : null;
  const totalInPeriod = data.reduce((acc, curr) => acc + curr.value, 0);
  const peakPoint = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;

  const handleMouseMove = (e) => {
    if (!containerRef.current || pts.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDistance = Infinity;
    pts.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all"
      style={{
        backgroundColor: 'var(--brand-surface, #ffffff)',
        borderColor: 'var(--iv-border, rgba(15, 23, 42, 0.08))',
      }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--brand-text, #0f172a)' }}
            >
              {title}
            </h3>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, #10b981 12%, transparent)',
                color: '#10b981',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--brand-text-muted, #64748b)' }}
          >
            {subtitle}
          </p>
        </div>

        {/* Period Pills & Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange?.(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePeriod === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
              }`}
              style={{
                backgroundColor:
                  activePeriod === p ? 'var(--iv-accent, #3b82f6)' : undefined,
                color: activePeriod === p ? '#ffffff' : undefined,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div>
          <span style={{ color: 'var(--brand-text-muted, #94a3b8)' }}>Total Intake: </span>
          <span className="font-bold text-sm" style={{ color: 'var(--brand-text, #0f172a)' }}>
            <NumberFlow value={totalInPeriod} />
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--brand-text-muted, #94a3b8)' }}>Peak Velocity: </span>
          <span className="font-bold text-sm" style={{ color: 'var(--brand-text, #0f172a)' }}>
            <NumberFlow value={peakPoint} />
          </span>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div
        ref={containerRef}
        className="relative w-full cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible block"
        >
          <defs>
            <linearGradient id={`area-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.38" />
              <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.14" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>

            <filter id={`line-glow-${id}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={color} floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="20"
              y1={svgHeight * ratio}
              x2={svgWidth - 20}
              y2={svgHeight * ratio}
              stroke="currentColor"
              strokeDasharray="4 6"
              strokeOpacity="0.08"
            />
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#area-grad-${id})`} />

          {/* Spline Stroke */}
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#line-glow-${id})`}
          />

          {/* Active Hover Crosshair Line */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1="10"
                x2={activePoint.x}
                y2={svgHeight - 20}
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill={color}
                opacity="0.25"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#ffffff"
                stroke={color}
                strokeWidth="2"
              />
            </g>
          )}

          {/* Month Axis Labels */}
          {pts.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={svgHeight - 4}
              textAnchor="middle"
              className="text-[11px] font-semibold"
              fill="var(--brand-text-muted, #94a3b8)"
            >
              {pt.month || pt.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip Pill */}
        {activePoint && (
          <div
            className="pointer-events-none absolute -top-3 z-20 flex flex-col items-center gap-0.5 rounded-xl border px-3 py-1.5 shadow-xl backdrop-blur-md transition-transform duration-75"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'var(--brand-surface, rgba(15, 23, 42, 0.85))',
              borderColor: 'var(--iv-border, rgba(255, 255, 255, 0.15))',
            }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--brand-text-muted, #94a3b8)' }}
            >
              {activePoint.month || activePoint.label}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black" style={{ color: color }}>
                <NumberFlow value={activePoint.value} />
              </span>
              <span className="text-[10px] font-medium" style={{ color: 'var(--brand-text-muted, #64748b)' }}>
                students
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BklitAreaChart;
