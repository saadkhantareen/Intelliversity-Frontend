# Intelliversity Frontend Context Pack

This folder contains a complete context handoff for external LLMs to understand the frontend codebase quickly and correctly.

Start with [00-system-context.md](./00-system-context.md) for the shortest accurate high-level map of the current codebase.

## Recommended Reading Order

1. [00-system-context.md](./00-system-context.md)
2. [01-system-overview.md](./01-system-overview.md)
3. [02-architecture-and-modules.md](./02-architecture-and-modules.md)
4. [03-routing-and-user-flows.md](./03-routing-and-user-flows.md)
5. [04-api-and-data-contracts.md](./04-api-and-data-contracts.md)
6. [05-file-map-and-responsibilities.md](./05-file-map-and-responsibilities.md)
7. [06-llm-handoff-notes.md](./06-llm-handoff-notes.md)
8. [07-runtime-state-and-storage.md](./07-runtime-state-and-storage.md)
9. [08-portal-ui-and-navigation.md](./08-portal-ui-and-navigation.md)
10. [09-known-inconsistencies-and-risks.md](./09-known-inconsistencies-and-risks.md)

## Scope

- Project: `intelliversity-frontend`
- Stack: React + Vite + React Router + Axios + Tailwind CSS
- Current implemented domain: authentication, profile hydration, admin academic screens, and forgot/reset password flow with tenant-aware branding.

## Source of Truth

All statements in these docs are derived from the current code under `src/` and root configs.

## Quick Facts

- `BrowserRouter` wraps the app at startup.
- `TenantProvider` detects tenant branding from the current hostname.
- `AuthProvider` manages login/auth state via localStorage tokens and JWT expiry checks.
- `ProfileProvider` hydrates the current profile and document list after auth.
- Protected routes use `ProtectedRoute` + `Outlet`.
- Backend base URL is derived from browser hostname with port `8000`.
- Portal shell UI is implemented via `DashboardShell` and portal-specific config wrappers.
- Layout components live under `src/components/layout/` and contain the dashboard shell and portal wrapper files (e.g. `DashboardShell.jsx`, `StudentLayout.jsx`, `FacultyLayout.jsx`, `AdminLayout.jsx`, `icons.jsx`, `PortalLayouts.jsx`).
- Route surface now includes dashboard, profile, admin academics, and user-management screens in addition to auth pages.

- **`10-bulk-upload.md`**: Explains the Frontend Bulk Upload implementation bridging files to the admin dashboard.
