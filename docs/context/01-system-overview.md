# System Overview

## What This Frontend Does

This frontend is a multi-tenant university portal shell focused on authentication flows.
Current implemented user journey:

- Login
- Forgot password request
- Reset password via tokenized URL
- Accessing a protected dashboard route after login

## Technology Stack

- React 19
- Vite 7
- React Router DOM 7
- Axios for HTTP client
- React Hot Toast for notifications
- Tailwind CSS for utility-first styling

## Runtime Composition

App root hierarchy in `src/main.jsx`:

1. `BrowserRouter`
2. `TenantProvider`
3. `AuthProvider`
4. `App`
5. `Toaster`

Why this matters:
- Routing is globally available.
- Tenant metadata is resolved before page rendering logic consumes it.
- Auth state is globally available for route guarding and login actions.

## Product Model (Current)

- Tenant awareness is determined by subdomain format.
- Portal variants configured in frontend: `student`, `teacher`, `admin`.
- Branding at UI level is tenant color + label.
- Functional scope currently behaves like student login flow, though routing itself is shared.

## Non-goals / Not Implemented Yet

- No role-specific route trees beyond a single dashboard route.
- No refresh-token lifecycle/interceptor handling.
- No backend logout call (local logout only).
- No global loading/skeleton orchestration outside route/auth checks.
