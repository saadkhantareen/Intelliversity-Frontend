# File Map and Responsibilities

## Root

- `package.json`:
  - Dependency and script manifest.
  - Scripts: `dev`, `build`, `lint`, `preview`.
- `vite.config.js`:
  - React plugin.
  - Dev server host + port (`5173`).
- `tailwind.config.js` + `postcss.config.js`:
  - Tailwind scanning and PostCSS plugin setup.

## Application Entry

- `src/main.jsx`:
  - Mounts React app.
  - Wrap order: `BrowserRouter` -> `TenantProvider` -> `AuthProvider` -> `App`.
  - Mounts `Toaster` globally.

- `src/App.jsx`:
  - Defines route graph and protected route nesting.

## Context Layer

- `src/context/TenantContext.jsx`:
  - Subdomain-based tenant detection and validation.

- `src/context/AuthContext.jsx`:
  - Auth state, persistence hydration, login/logout actions.

## Shared Components

- `src/components/shared/ProtectedRoute.jsx`:
  - Gate for authenticated routes.

## Layout Components

- `src/components/layout/DashboardShell.jsx`:
  - Main authenticated app chrome (responsive sidebar, topbar, outlet rendering).
  - Handles logout trigger and shows user/university metadata.

- `src/components/layout/StudentLayout.jsx`:
  - Student portal config wrapper around `DashboardShell`.

- `src/components/layout/FacultyLayout.jsx`:
  - Faculty portal config wrapper around `DashboardShell`.

- `src/components/layout/AdminLayout.jsx`:
  - Admin portal config wrapper around `DashboardShell`.

- `src/components/layout/icons.jsx`:
  - Shared icon primitives used by shell and nav config.

- `src/components/layout/PortalLayouts.jsx`:
  - Portal layout switcher mapping portal keys to portal wrapper components (may be empty or extended to add portal-specific composition).

## Pages

- `src/pages/auth/LoginPage.jsx`:
  - Login form and post-login redirect.

- `src/pages/auth/ForgotPasswordPage.jsx`:
  - Forgot password request form and submitted state.

- `src/pages/auth/ResetPasswordPage.jsx`:
  - Token-based reset form.

- `src/pages/student/DashboardPage.jsx`:
  - Placeholder protected page.

- `src/pages/errors/NotFound.jsx`:
  - Fallback 404 page.

## Services

- `src/services/api.js`:
  - Shared Axios instance with tenant-aware base URL.

- `src/services/auth.service.js`:
  - Authentication-related endpoint methods.

## Styling

- `src/index.css`:
  - Tailwind directives only.

- `src/App.css`:
  - Currently empty.
