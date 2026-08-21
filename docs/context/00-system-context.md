# Intelliversity Frontend System Context

This document is the highest-level handoff for the frontend codebase. It is written so an external LLM can understand the app structure, routing model, runtime state, portal architecture, and backend coupling without reading source first.

## 1. What this frontend is

Intelliversity Frontend is a React + Vite single-page application that serves three portal experiences on the same codebase:

- student
- faculty
- admin

The portal is chosen from the browser hostname. The same frontend shell adapts itself using tenant branding, portal configuration, and authenticated user state.

## 2. Repository structure

```text
Intelliversity-Frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── components/
│   ├── routes/
│   └── pages/
└── docs/
    └── context/
        ├── 00-context-index.md
        ├── 00-system-context.md
        ├── 01-system-overview.md
        ├── 02-architecture-and-modules.md
        ├── 03-routing-and-user-flows.md
        ├── 04-api-and-data-contracts.md
        ├── 05-file-map-and-responsibilities.md
        ├── 06-llm-handoff-notes.md
        ├── 07-runtime-state-and-storage.md
        ├── 08-portal-ui-and-navigation.md
        ├── 09-known-inconsistencies-and-risks.md
        └── 10-bulk-upload.md
```

## 3. Runtime composition

The application boot order in [src/main.jsx](../../src/main.jsx) is:

1. `BrowserRouter`
2. `TenantProvider`
3. `AuthProvider`
4. `ProfileProvider`
5. `App`
6. `Toaster`

That order matters because:

- routing is needed before route guards and tenant-aware links
- tenant branding must load before UI renders
- auth state must hydrate before protected routes open
- profile data is fetched only after authentication succeeds

## 4. Core frontend subsystems

### 4.1 Tenant context

`TenantProvider` resolves tenant branding from the current hostname.

It:

- reads `window.location.hostname`
- calls the tenant branding endpoint through `getPortalBranding(domain)`
- stores tenant branding data in context
- applies CSS variables from the backend branding payload
- applies favicon updates
- exposes loading and error state

The tenant context is the source of truth for:

- portal slug
- university identity
- color/theme variables
- logo/favicon assets

### 4.2 Auth context

`AuthProvider` manages JWT auth state.

It:

- loads `access_token`, `refresh_token`, and serialized `user` from `localStorage`
- checks JWT expiry on startup
- marks the user authenticated if a valid token exists
- exposes `login()` and `logout()` helpers
- stores the authenticated user together with the university payload returned by login

### 4.3 Profile context

`ProfileProvider` fetches and caches the current profile and document list for authenticated users.

It:

- calls `ProfileService.getMyProfile()`
- calls `ProfileService.getMyDocuments()`
- provides update helpers for profile, profile picture, document upload, and document deletion
- resets profile state on logout

### 4.4 API layer

`src/services/api.js` creates Axios clients.

It:

- derives the backend origin from the current browser hostname
- defaults the backend port to `8000`
- attaches the bearer token automatically
- clears local auth state on HTTP 401
- redirects to `/login` when the token is invalid or expired

## 5. Routing model

### 5.1 Public routes

The app exposes public routes for:

- `/login`
- `/forgot-password`
- `/reset-password/:uidb64/:token`

### 5.2 Protected routes

Protected routes are wrapped by `ProtectedRoute`.

Protection rules:

- if auth is still hydrating, show a loading screen
- if no authenticated session exists, redirect to `/login`
- if the user has role restrictions that do not match the portal slug, show access denied

### 5.3 Portal-aware route switching

The app uses the resolved tenant portal to choose the right shell and page.

Examples:

- `PortalLayoutRouter` picks `StudentLayout`, `FacultyLayout`, or `AdminLayout`
- `DashboardRouter` picks the portal-specific dashboard page
- `CoursesRouter` picks the portal-specific course page
- `ProfileRouter` picks the portal-specific profile page

### 5.4 Current protected route surface

The protected route table currently includes:

- `/profile`
- `/dashboard`
- `/academics/departments`
- `/academics/departments/create`
- `/academics/departments/edit/:id`
- `/academics/programs`
- `/academics/programs/create`
- `/academics/programs/edit/:id`
- `/academics/courses`
- `/academics/courses/create`
- `/academics/courses/edit/:id`
- `/academics/curriculums`
- `/academics/curriculums/create`
- `/academics/curriculums/edit/:id`
- `/academics/batches`
- `/academics/batches/create`
- `/academics/batches/edit/:id`
- `/academics/academic-years`
- `/academics/academic-years/create`
- `/academics/academic-years/edit/:id`
- `/academics/terms`
- `/academics/terms/create`
- `/academics/terms/edit/:id`
- `/users/students`
- `/users/faculty`

## 6. Portal shell and navigation

`DashboardShell` provides the shared dashboard frame:

- collapsible desktop sidebar
- mobile drawer sidebar
- top bar with notifications and user avatar
- outlet-based main content area
- logout action

Portal-specific layout wrappers provide configuration to the shell:

- `StudentLayout`
- `FacultyLayout`
- `AdminLayout`

These wrappers supply portal labels, accent colors, badges, and navigation sections.

## 7. Backend coupling

Frontend code is coupled to the backend through these expectations:

- tenant branding is fetched from the tenant endpoint using the current hostname
- auth login returns `tokens`, `user`, and `university`
- profile APIs return the current user profile and document list
- bearer tokens are expected in the `Authorization` header
- response `401` means clear auth state and redirect to login

## 8. Runtime storage contract

The frontend stores the following keys in `localStorage`:

- `access_token`
- `refresh_token`
- `user`

These values are the backbone of the authenticated session.

## 9. Important source modules

- [src/main.jsx](../../src/main.jsx)
- [src/App.jsx](../../src/App.jsx)
- [src/context/TenantContext.jsx](../../src/context/TenantContext.jsx)
- [src/context/AuthContext.jsx](../../src/context/AuthContext.jsx)
- [src/context/ProfileContext.jsx](../../src/context/ProfileContext.jsx)
- [src/services/api.js](../../src/services/api.js)
- [src/components/shared/ProtectedRoute.jsx](../../src/components/shared/ProtectedRoute.jsx)
- [src/components/layout/DashboardShell.jsx](../../src/components/layout/DashboardShell.jsx)
- [src/components/layout/StudentLayout.jsx](../../src/components/layout/StudentLayout.jsx)
- [src/components/layout/FacultyLayout.jsx](../../src/components/layout/FacultyLayout.jsx)
- [src/components/layout/AdminLayout.jsx](../../src/components/layout/AdminLayout.jsx)
- [src/routes/DashboardRouter.jsx](../../src/routes/DashboardRouter.jsx)
- [src/routes/CoursesRouter.jsx](../../src/routes/CoursesRouter.jsx)

## 10. Current implementation status

The frontend is more complete than a simple auth-only shell. It already includes:

- tenant-aware branding
- auth persistence
- profile loading and document handling
- multi-portal layout wrappers
- admin academic screens
- student course and registration-related screens

However, the route tree is still partially ahead of the mounted pages in some areas. Some sidebar items exist before their full route implementations are complete.

## 11. External-LLM reading guidance

If an outside LLM is going to modify this frontend, it should preserve these invariants unless a refactor is explicitly requested:

1. `BrowserRouter` wraps the app at startup.
2. Tenant must resolve before branding-sensitive UI renders.
3. Auth state must hydrate before protected routes open.
4. Profile data is tied to the authenticated user.
5. The backend base URL is derived from the current hostname with port `8000`.
6. Portal shell selection depends on the tenant portal slug.
7. Changes should keep the tenant branding and auth contract stable.
