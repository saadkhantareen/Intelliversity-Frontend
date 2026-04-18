# Architecture and Modules

## High-Level Module Boundaries

- `src/main.jsx`: bootstrap and provider wiring.
- `src/App.jsx`: route table declaration.
- `src/context/`: global state providers (`AuthContext`, `TenantContext`).
- `src/pages/`: route components grouped by domain (`auth`, `student`, `errors`).
- `src/components/shared/`: cross-page components (`ProtectedRoute`).
- `src/components/layout/`: dashboard shell and portal wrappers (`StudentLayout`, `FacultyLayout`, `AdminLayout`).
- `src/services/`: backend API integration (`api.js`, `auth.service.js`).

## TenantContext (`src/context/TenantContext.jsx`)

### Responsibilities

- Detect tenant from hostname segments.
- Validate portal type against static config map.
- Expose resolved tenant state for UI branding and behavior decisions.

### Detection Logic

- Hostname is split by `.`.
- `parts[0]` => portal (`student`, `teacher`, `admin`).
- `parts[1]` => university key/name.
- Invalid portal => context marked invalid.

### Exposed Context Shape

- `portal: string | null`
- `university: string | null`
- `config: { label, color } | null`
- `isValid: boolean`
- `isResolved: boolean`

## AuthContext (`src/context/AuthContext.jsx`)

### Responsibilities

- Persist authentication session in `localStorage`.
- Provide `login` and `logout` actions.
- Expose auth state to route guards and pages.

### State Model

- `user`
- `token` (access token)
- `isAuthenticated`
- `isLoading`

### Persistence Keys

- `access_token`
- `refresh_token`
- `user` (stringified object)

### Login Flow (inside context)

1. Calls `authService.login(credentials)`.
2. Extracts `tokens`, `user`, `university` from response.
3. Stores tokens/user in `localStorage`.
4. Sets authenticated state.
5. Shows success toast.
6. On failure, maps nested backend error shape to a toast message and rethrows.

### Logout Flow

- Clears all auth-related localStorage keys.
- Resets in-memory auth state.
- Displays success toast.

## ProtectedRoute (`src/components/shared/ProtectedRoute.jsx`)

- If `isLoading`: renders full-screen loading text.
- If unauthenticated: redirects to `/login`.
- If authenticated: renders nested route with `Outlet`.

## Layout System (`src/components/layout/*`)

### Responsibilities

- `DashboardShell.jsx` is the base chrome component (sidebar, topbar, outlet area, logout action).
- Portal wrapper components provide a portal-specific `config` object (accent, sections, nav links, labels).
- Route rendering composes as: `ProtectedRoute` -> `PortalLayout` -> `DashboardShell` -> `Outlet`.

### Portal Wrappers

- `StudentLayout.jsx`: uses blue accent and student-oriented nav sections.
- `FacultyLayout.jsx`: uses green accent and faculty-oriented nav sections.
- `AdminLayout.jsx`: uses amber accent and admin-oriented nav sections.

### Important Caveat

- In `TenantContext`, valid portal keys are `student`, `teacher`, `admin`.
- In `App.jsx`, portal-to-layout switching checks `admin`, `faculty`, defaulting otherwise to student layout.
- This means `teacher` and `faculty` naming is currently inconsistent and should be treated carefully during refactors.

## Service Layer

### `src/services/api.js`

- Creates an Axios instance.
- Base URL format:
  - `${window.location.protocol}//${window.location.hostname}:8000`
- This ensures frontend and backend align on tenant subdomain host.

### `src/services/auth.service.js`

Exposes methods:

- `login(credentials)` -> POST `/api/v1/accounts/login/`
- `forgotPassword(data)` -> POST `/api/v1/accounts/forgot-password/`
- `resetPassword(uidb64, token, data)` -> POST `/api/v1/accounts/reset-password/:uidb64/:token/`
- `logout()` -> local resolved promise (placeholder)
