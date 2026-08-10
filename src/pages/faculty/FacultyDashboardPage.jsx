import React from 'react';

function FacultyDashboardPage() {
  return (
    <div className="p-6" style={{ color: 'var(--brand-text)' }}>
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: 'var(--brand-surface)',
          borderColor: 'color-mix(in srgb, var(--brand-text) 10%, transparent)',
        }}
      >
        <h1 className="text-xl font-semibold" style={{ color: 'var(--brand-text)' }}>
          Faculty Dashboard
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--brand-text-muted)' }}>
          Dashboard content will appear here.
        </p>
      </div>
    </div>
  );
}

export default FacultyDashboardPage;
