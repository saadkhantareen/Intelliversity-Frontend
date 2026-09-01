// Intelliversity-Frontend/src/features/attendance/components/ui.jsx
import { useState } from "react";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 disabled:bg-slate-100 disabled:text-slate-400";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-900 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-900 border-emerald-200",
    rose: "bg-rose-50 text-rose-900 border-rose-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    sky: "bg-sky-50 text-sky-900 border-sky-200",
  };
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value ?? "—"}</p>
      {hint && <p className="mt-1 text-xs opacity-75">{hint}</p>}
    </div>
  );
}

export function Field({ label, hint, required, children, error }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export function SimpleSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = "— Select —",
  required,
  hint,
  disabled,
}) {
  return (
    <Field label={label} required={required} hint={hint}>
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({ label, hint, checked, onChange, disabled }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
      />
      <div>
        <span className="text-sm font-medium text-slate-800">{label}</span>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    </label>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  onClick,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition rounded-xl outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    sky: "bg-sky-100 text-sky-800 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  if (s === "present") return <Badge tone="emerald">Present</Badge>;
  if (s === "absent") return <Badge tone="rose">Absent</Badge>;
  if (s === "leave") return <Badge tone="sky">Leave</Badge>;
  return <Badge tone="slate">{status || "Unmarked"}</Badge>;
}

export function ProgressBar({ percent, threshold = 75 }) {
  if (percent === null || percent === undefined) {
    return <div className="h-2 w-full rounded-full bg-slate-100" />;
  }
  const clamped = Math.max(0, Math.min(100, Number(percent)));
  const isLow = clamped < threshold;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full transition-all duration-300 ${
          isLow ? "bg-rose-500" : "bg-emerald-500"
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Loading({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800 mb-2" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-900">
      <h3 className="text-base font-semibold">Something went wrong</h3>
      <p className="mt-1 text-sm text-rose-700">{message}</p>
      {onRetry && (
        <Button variant="danger" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Notice({ children, tone = "amber" }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return (
    <div className={`mb-6 rounded-xl border p-4 text-sm ${tones[tone] || tones.amber}`}>
      {children}
    </div>
  );
}

export function RawDebug({ data, label = "Show raw API response" }) {
  const [open, setOpen] = useState(false);
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-mono text-slate-400 hover:underline"
      >
        {open ? "▼ Hide debug" : `▶ ${label}`}
      </button>
      {open && (
        <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-slate-900 p-3 text-xs font-mono text-emerald-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
