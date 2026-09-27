export function BklitActivityFeed({
  title = 'Live Campus Audit & Events',
  subtitle = 'Real-time actions across administrative and faculty operations',
  activities = [],
}) {
  return (
    <div
      className="rounded-2xl border p-6 shadow-sm transition-all"
      style={{
        backgroundColor: 'var(--brand-surface, #ffffff)',
        borderColor: 'var(--iv-border, rgba(15, 23, 42, 0.08))',
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3
          className="text-base font-bold tracking-tight"
          style={{ color: 'var(--brand-text, #0f172a)' }}
        >
          {title}
        </h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </div>
      <p
        className="text-xs mb-5"
        style={{ color: 'var(--brand-text-muted, #64748b)' }}
      >
        {subtitle}
      </p>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.dotColor || 'bg-blue-500'}`}
              />
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: 'var(--brand-text, #0f172a)' }}
                >
                  {item.action}
                </p>
                <p
                  className="text-[11.5px] truncate"
                  style={{ color: 'var(--brand-text-muted, #64748b)' }}
                >
                  {item.detail}
                </p>
              </div>
            </div>

            <span
              className="flex-shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-medium"
              style={{
                backgroundColor: 'var(--iv-hover, rgba(15, 23, 42, 0.04))',
                color: 'var(--brand-text-muted, #94a3b8)',
              }}
            >
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BklitActivityFeed;
