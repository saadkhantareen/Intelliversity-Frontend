import { useId } from 'react';

/**
 * Creates smooth cubic bezier path for sparklines
 */
function createSpline(points, width, height, padding = 4) {
  if (!points || points.length === 0) {
    return { path: '', areaPath: '', pts: [], lastPoint: { x: 0, y: 0 } };
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const pts = points.map((val, idx) => {
    const x = padding + (idx / (points.length - 1)) * w;
    const y = padding + h - ((val - min) / range) * h;
    return { x, y, val };
  });

  if (pts.length === 1) {
    return {
      path: `M ${pts[0].x} ${pts[0].y}`,
      areaPath: `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} ${height} L ${pts[0].x} ${height} Z`,
      pts,
      lastPoint: pts[0],
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
  const areaPath = `${path} L ${last.x} ${height} L ${first.x} ${height} Z`;

  return { path, areaPath, pts, lastPoint: last };
}

export function BklitSparkline({
  data = [],
  width = 120,
  height = 42,
  color = '#38bdf8',
  showPulse = true,
  className = '',
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '');
  const { path, areaPath, lastPoint } = createSpline(data, width, height, 4);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible block w-full h-full"
      >
        <defs>
          <linearGradient id={`spark-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
          <filter id={`spark-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Gradient fill underneath */}
        <path d={areaPath} fill={`url(#spark-grad-${id})`} />

        {/* Crisp line */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulsating pulse tip on the latest data point */}
        {showPulse && lastPoint && (
          <g transform={`translate(${lastPoint.x}, ${lastPoint.y})`}>
            <circle r="4.5" fill={color} opacity="0.3">
              <animate
                attributeName="r"
                values="3;6.5;3"
                dur="2.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0.1;0.5"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="2.5" fill="#ffffff" stroke={color} strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}

export default BklitSparkline;
