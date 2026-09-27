import { useState } from 'react';
import NumberFlow from '@number-flow/react';

const DEPARTMENT_COLORS = [
  { from: '#3b82f6', to: '#60a5fa' },
  { from: '#8b5cf6', to: '#a78bfa' },
  { from: '#10b981', to: '#34d399' },
  { from: '#f59e0b', to: '#fbbf24' },
  { from: '#ec4899', to: '#f472b6' },
  { from: '#06b6d4', to: '#22d3ee' },
  { from: '#6366f1', to: '#818cf8' },
];

export function BklitDepartmentBreakdown({
  title = 'Students by Academic Department',
  subtitle = 'Current semester active enrollment density',
  data = [],
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const totalStudents = data.reduce((acc, curr) => acc + curr.students, 0) || 1;
  const maxStudents = Math.max(...data.map((d) => d.students)) || 1;

  return (
    <div
      className="flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all"
      style={{
        backgroundColor: 'var(--brand-surface, #ffffff)',
        borderColor: 'var(--iv-border, rgba(15, 23, 42, 0.08))',
      }}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3
            className="text-base font-bold tracking-tight"
            style={{ color: 'var(--brand-text, #0f172a)' }}
          >
            {title}
          </h3>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, #8b5cf6 12%, transparent)',
              color: '#8b5cf6',
            }}
          >
            {data.length} Depts
          </span>
        </div>
        <p
          className="text-xs mb-5"
          style={{ color: 'var(--brand-text-muted, #64748b)' }}
        >
          {subtitle}
        </p>

        {/* Department List */}
        <div className="space-y-3.5">
          {data.map((item, idx) => {
            const pct = Math.round((item.students / totalStudents) * 100);
            const widthPct = Math.round((item.students / maxStudents) * 100);
            const color = DEPARTMENT_COLORS[idx % DEPARTMENT_COLORS.length];
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.name}
                className="group cursor-default rounded-xl p-2 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Header row */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color.from }}
                    />
                    <span
                      className="font-medium transition-colors group-hover:text-blue-500"
                      style={{ color: 'var(--brand-text, #0f172a)' }}
                    >
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: 'var(--brand-text, #0f172a)' }}
                    >
                      <NumberFlow value={item.students} />
                    </span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--brand-text-muted, #94a3b8)' }}
                    >
                      ({pct}%)
                    </span>
                  </div>
                </div>

                {/* Bar track */}
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{
                    backgroundColor: 'var(--iv-border, rgba(15, 23, 42, 0.06))',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${widthPct}%`,
                      background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                      boxShadow: isHovered
                        ? `0 0 10px ${color.from}`
                        : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Insight */}
      <div
        className="mt-5 pt-4 border-t flex items-center justify-between text-xs"
        style={{ borderColor: 'var(--iv-border, rgba(15, 23, 42, 0.06))' }}
      >
        <span style={{ color: 'var(--brand-text-muted, #64748b)' }}>
          Capacity Utilization
        </span>
        <span className="font-bold" style={{ color: '#10b981' }}>
          92.4% Optimal
        </span>
      </div>
    </div>
  );
}

export default BklitDepartmentBreakdown;
