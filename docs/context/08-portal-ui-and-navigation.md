# Portal UI and Navigation

## UI Composition Model

Authenticated UI is composed by:

1. `ProtectedRoute`
2. Portal layout selector in `App.jsx`
3. Portal wrapper (`StudentLayout` / `FacultyLayout` / `AdminLayout`)
4. `DashboardShell` shared chrome
5. Child route rendered via `Outlet`

## DashboardShell Responsibilities

`DashboardShell` is the reusable app frame and handles:

- Responsive sidebar (desktop + mobile drawer)
- Topbar with search field, notifications icon, and user chip
- University/portal branding display
- Nav section rendering from passed `config`
- Logout interaction (`logout` + `navigate('/login')`)

## Config-Driven Navigation

Each portal wrapper passes:

- `accent` color
- `label`
- `badge` colors
- `sections`: list of sidebar groups and items

Important: many nav links are placeholders for future pages. Current route table only defines a small subset (`/dashboard` plus auth routes).

## Active Navigation Behavior

- Nav links use `NavLink` active-state classes.
- Sidebar supports collapse on desktop.
- Mobile menu opens via hamburger button and closes on overlay click/escape.

## Styling Strategy

- `DashboardShell` injects scoped CSS string with runtime accent variable.
- Tailwind utilities are used heavily in page/auth components.
- `src/index.css` only includes Tailwind directives.

## Route Surface vs Navigation Surface

Current mismatch is expected during incremental development:

- Sidebar menus advertise future IA (courses, grades, settings, etc.).
- Route declarations currently implement only auth pages, dashboard, and 404.

When extending app behavior, keep shell config and `App.jsx` routes synchronized.
