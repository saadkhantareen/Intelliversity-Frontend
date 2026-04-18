# Intelliversity Frontend Context Pack

This folder contains a complete context handoff for external LLMs to understand the frontend codebase quickly and correctly.

## Recommended Reading Order

1. [01-system-overview.md](./01-system-overview.md)
2. [02-architecture-and-modules.md](./02-architecture-and-modules.md)
3. [03-routing-and-user-flows.md](./03-routing-and-user-flows.md)
4. [04-api-and-data-contracts.md](./04-api-and-data-contracts.md)
5. [05-file-map-and-responsibilities.md](./05-file-map-and-responsibilities.md)
6. [06-llm-handoff-notes.md](./06-llm-handoff-notes.md)
7. [07-runtime-state-and-storage.md](./07-runtime-state-and-storage.md)
8. [08-portal-ui-and-navigation.md](./08-portal-ui-and-navigation.md)
9. [09-known-inconsistencies-and-risks.md](./09-known-inconsistencies-and-risks.md)

## Scope

- Project: `intelliversity-frontend`
- Stack: React + Vite + React Router + Axios + Tailwind CSS
- Current implemented domain: authentication and forgot/reset password flow with tenant-aware branding.

## Source of Truth

All statements in these docs are derived from the current code under `src/` and root configs.

## Quick Facts

- `BrowserRouter` wraps the app at startup.
- `TenantProvider` detects tenant from subdomain.
- `AuthProvider` manages login/auth state via localStorage tokens.
- Protected routes use `ProtectedRoute` + `Outlet`.
- Backend base URL is derived from browser hostname with port `8000`.
- Portal shell UI is implemented via `DashboardShell` and portal-specific config wrappers.
- Layout components live under `src/components/layout/` and contain the dashboard shell and portal wrapper files (e.g. `DashboardShell.jsx`, `StudentLayout.jsx`, `FacultyLayout.jsx`, `AdminLayout.jsx`, `icons.jsx`, `PortalLayouts.jsx`).
- Current route surface is intentionally small, while side navigation already contains future route placeholders.

- **`10-bulk-upload.md`**: Explains the Frontend Bulk Upload implementation bridging files to the admin dashboard.
