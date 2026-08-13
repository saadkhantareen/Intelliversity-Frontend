# Multi-Tenant AI Powered University Management System

A React + Vite single-page application for managing academic operations — admissions cycles, courses, curriculum, batches, terms, and role-based portals for **Admins**, **Faculty**, and **Students** — built on a scalable, feature-based architecture.



## Table of Contents
- [Multi-Tenant AI Powered University Management System](#multi-tenant-ai-powered-university-management-system)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
  - [Project Architecture](#project-architecture)
    - [Why Feature-Based Architecture](#why-feature-based-architecture)
    - [Codebase Structure](#codebase-structure)
    - [Dependency Direction (Layering Rules)](#dependency-direction-layering-rules)
  - [Where to Put New Code](#where-to-put-new-code)
  - [Barrel Imports/Exports](#barrel-importsexports)
  - [Why Barrel Imports Are NOT Used in Routers](#why-barrel-imports-are-not-used-in-routers)
  - [Dependency Overview \& Don'ts](#dependency-overview--donts)
    - [Core dependencies (see `package.json` for exact versions)](#core-dependencies-see-packagejson-for-exact-versions)
    - [Don'ts](#donts)
  - [Coding Conventions](#coding-conventions)
  - [Contributing](#contributing)



## Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite |
| UI library | React |
| Routing | React Router (lazy-loaded, portal-based) |
| Package manager | pnpm |
| HTTP client | Axios (via `shared/api/client.js`) |
| Media/Uploads | Cloudinary |
| Styling | Global CSS (`app/styles/index.css`) — update if you use Tailwind/CSS Modules |


## Prerequisites

- **Node.js** `>= 18.x`
- **pnpm** `>= 8.x`

Enable pnpm via Corepack (recommended) if it isn't installed:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Getting Started

Clone the repository and set up the project locally:

```bash
# 1. Clone the repository
git clone git@github.com:saadkhantareen/Intelliversity-Frontend.git
cd Intelliversity-Frontend

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# then fill in the required values — see "Environment Variables" below

# 4. Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173` by default.


## Environment Variables

Create a `.env` file at the project root (never commit this file). Typical variables for this stack:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_GLOBAL_API_URL=your-global-api-url
VITE_API_TENANTS_BRANDING_URL=your-tenant-branding-url
```

Adjust these to match your actual `.env.example` — Vite only exposes variables prefixed with `VITE_` to the client.


## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts the Vite dev server with HMR |
| `pnpm build` | Builds an optimized production bundle |
| `pnpm preview` | Serves the production build locally |
| `pnpm lint` | Runs ESLint across the codebase |


## Project Architecture

### Why Feature-Based Architecture

This codebase is organized **by feature/domain**, not by file type (i.e. no global `components/`, `hooks/`, `services/` dumping grounds for everything). This is intentional:

- **Colocation** — everything related to a domain (`courses`, `auth`, `terms`, etc.) lives together: its pages, API calls, hooks, and context. You don't hunt across five folders to understand one feature.
- **Scalability** — as the system grows (new modules, new portals), you add a new `features/<feature>` folder instead of bloating shared, type-based folders.
- **Encapsulation** — a feature's internals are private by default and only exposed intentionally through its `index.js` barrel, reducing accidental tight coupling.
- **Team ownership** — different teams/contributors can own different feature folders with minimal merge conflicts.
- **Easier removal/refactoring** — deleting or replacing a feature is close to deleting one folder, instead of untangling references scattered across the app.
- **Portal alignment** — Admin, Faculty, and Student experiences map naturally onto features and layouts rather than one monolithic page tree.

### Codebase Structure

```
├── app/                        # Application shell — composition layer, not business logic
│   ├── App.jsx                 # Root component
│   ├── layouts/                # Portal-level layout shells (Admin, Faculty, Student, Dashboard)
│   ├── pages/errors/            # App-wide fallback pages (404, portal-not-found)
│   ├── providers/               # Global provider composition (context, query client, etc.)
│   ├── router/                  # Route definitions, lazy-loaded route trees
│   └── styles/                  # Global CSS
│
├── features/                   # Business domains — the core of the app
│   └── <feature>/
│       ├── api/                 # *.service.js — API calls for this feature
│       ├── context/              # Feature-scoped React context (if needed)
│       ├── hooks/                # Feature-scoped custom hooks (if needed)
│       ├── layouts/              # Feature-scoped nested layouts (if needed)
│       ├── pages/                # Route-level page components
│       ├── utils/                # Feature-scoped helper functions (if needed)
│       └── index.js              # Barrel file — the feature's public API
│
├── shared/                     # Cross-cutting, reusable, feature-agnostic code
│   ├── api/                     # Shared API client (Axios instance, interceptors)
│   ├── components/              # App-wide reusable UI (buttons, cards, icons, fields)
│   ├── hooks/                    # App-wide reusable hooks
│   └── lib/                      # Generic utilities, formatters, constants
│
└── main.jsx                    # Vite/React entry point
```

### Dependency Direction (Layering Rules)

Dependencies must flow **in one direction only**:

```
app  →  features  →  shared
```

- `shared/` must **never** import from `features/` or `app/`. It knows nothing about the domain.
- `features/*` may import from `shared/`, but should **avoid importing from other features' internals**. If two features need the same logic, promote it to `shared/`.
- `app/` composes `features/` and `shared/` together (routing, layouts, providers) — it should contain minimal business logic itself.

---

## Where to Put New Code

Quick reference for where new files belong:

| File type | Location | What it's for |
|---|---|---|
| **Page/Screen** | `features/<feature>/pages/` | Route-level component rendered by the router for a specific URL. |
| **Feature-specific component** | `features/<feature>/components/` (create if needed) | UI reused only within that one feature, not exposed elsewhere. |
| **Shared/app-wide component** | `shared/components/ui/` | Generic, reusable UI primitives (cards, fields, buttons) used across multiple features. |
| **Icons** | `shared/components/icons.jsx` | Centralized icon components used app-wide. |
| **Feature-specific hook** | `features/<feature>/hooks/` | Stateful logic scoped to one feature (e.g. `useCourseFilters`). |
| **Shared hook** | `shared/hooks/` | Generic, reusable hooks with no domain knowledge (e.g. `useDebounce`). |
| **API/service call** | `features/<feature>/api/<name>.service.js` | Functions that call endpoints relevant to that feature (e.g. `course.service.js`). |
| **Shared API client** | `shared/api/client.js` | The single configured Axios instance (base URL, interceptors, auth headers). All services import from here. |
| **Context/Provider (feature)** | `features/<feature>/context/` | State/context scoped to one feature (e.g. `ProfileContext`). |
| **Global provider composition** | `app/providers/AppProviders.jsx` | Wraps the app with all top-level providers (theme, auth, tenant, query client, etc.). |
| **Portal-level layout** | `app/layouts/` | Layout shells shared across a portal (e.g. `AdminLayout`, `StudentLayout`). |
| **Feature-level layout** | `features/<feature>/layouts/` | Nested layout used only within a feature (e.g. `CourseDetailLayout`). |
| **Router/route config** | `app/router/` | Route definitions and lazy-loaded route trees, one router file per major section. |
| **Feature-specific utility** | `features/<feature>/utils/` | Pure helper functions specific to that domain (e.g. `tenantUtils.js`). |
| **Shared utility/lib** | `shared/lib/` | Generic, reusable helpers with no domain knowledge (formatters, validators, constants). |
| **Error/fallback page** | `app/pages/errors/` | App-wide 404s and "portal not found" style pages. |
| **Global styles** | `app/styles/` | App-wide CSS, resets, and design tokens. |
| **New feature module** | `features/<new-feature>/` | Create the standard subfolders (`api`, `pages`, `index.js`, and any of `hooks`, `context`, `layouts`, `utils` you actually need) — don't scaffold folders you won't use. |


## Barrel Imports/Exports

Each feature has an `index.js` at its root — its **barrel file** — which re-exports only what should be publicly consumed outside that feature (pages, key hooks, context providers, etc.).

**Example — `features/courses/index.js`:**

```js
export { default as CourseList } from './pages/admin/CourseList';
export { default as CourseForm } from './pages/admin/CourseForm';
export { default as FacultyCoursesPage } from './pages/faculty/FacultyCoursesPage';
export { default as RegisteredCourses } from './pages/student/RegisteredCourses';
export * from './api/course.service';
```

**Usage from outside the feature:**

```js
// ✅ Good — consumes the feature's public API
import { CourseList, CourseForm } from '@/features/courses';

// 🚫 Avoid — reaches into the feature's internals directly
import CourseList from '@/features/courses/pages/admin/CourseList';
```

**Why this matters:**
- It gives each feature a clear, intentional **public contract** — internal file moves/renames don't break consumers.
- It prevents other parts of the app from depending on implementation details (like exact file paths or internal folder structure) that should be free to change.
- It makes it obvious, at a glance, what a feature actually offers to the rest of the app.



## Why Barrel Imports Are NOT Used in Routers

Router files (`app/router/*.jsx`) intentionally **bypass barrel files** and import page components directly from their real file path, using `React.lazy()`:

```js
// ✅ Correct — router imports directly, enabling code-splitting
const CourseList = lazy(() => import('@/features/courses/pages/admin/CourseList'));

// 🚫 Wrong — importing via the barrel defeats lazy loading
const CourseList = lazy(() =>
  import('@/features/courses').then((m) => ({ default: m.CourseList }))
);
```

**Reason:** `React.lazy()` relies on Vite/Rollup being able to statically analyze each `import()` call and split it into its own chunk. A feature's `index.js` barrel re-exports *everything* from that feature in one module. If a router lazily imports through the barrel:

- Bundlers can't cleanly split just the one page you need — they either bundle the **entire feature** into that chunk, or fail to tree-shake unused exports properly.
- You lose the primary benefit of route-based code-splitting: shipping only the JS a given route actually needs.
- It can also introduce **circular import risks**, since the barrel may pull in sibling pages/services that themselves aren't needed for that route yet.

**Rule of thumb:** Barrel files are for **cross-feature/app-level consumption** (providers, non-router composition). Routers always import the specific page file directly.



## Dependency Overview & Don'ts

### Core dependencies (see `package.json` for exact versions)
- `react`, `react-dom` — UI library
- `react-router-dom` — routing
- `axios` — HTTP client, configured once in `shared/api/client.js`
- `vite` — build tool/dev server
- Cloudinary SDK/widget — media uploads (`features/media`)

### Don'ts

- 🚫 **Don't** reach into another feature's internal files — always import via that feature's `index.js` barrel (except router files, which import page paths directly for lazy-loading).
- 🚫 **Don't** import `features/*` from `shared/*` — shared code must remain domain-agnostic and reusable anywhere.
- 🚫 **Don't** import one feature directly into another feature. If logic needs to be shared, move it to `shared/`.
- 🚫 **Don't** create a new Axios instance in a service file — always import the shared client from `shared/api/client.js`.
- 🚫 **Don't** put raw API calls inside components/pages — keep them in `*.service.js` files under `features/<feature>/api/`.
- 🚫 **Don't** hardcode API URLs, keys, or secrets — use `VITE_`-prefixed environment variables.
- 🚫 **Don't** commit `.env` files — only commit `.env.example` with placeholder values.
- 🚫 **Don't** add global CSS outside `app/styles/` — scope component styles locally where possible.
- 🚫 **Don't** introduce a new state-management/data-fetching library without team discussion — stay consistent with existing patterns (Context + services, etc.).
- 🚫 **Don't** create deep, ad-hoc folders inside a feature "just in case" — only scaffold `hooks/`, `context/`, `layouts/`, or `utils/` when the feature actually needs them.



## Coding Conventions

| Convention | Rule | Example |
|---|---|---|
| Components/Pages | `PascalCase.jsx` | `CourseForm.jsx` |
| Hooks | `camelCase.js`, prefixed with `use` | `useBranding.js` |
| Services | `<domain>.service.js` | `course.service.js` |
| Feature folders | `kebab-case` | `academic-year/` |
| Barrel file | Always `index.js` at feature root | `features/courses/index.js` |


## Contributing

1. Create a feature branch off `main`: `git checkout -b feat/<short-description>`.
2. Follow the folder conventions above — new domain logic goes in `features/`, not `shared/` or `app/`.
3. Keep commits focused; use clear, conventional commit messages (e.g. `feat(courses): add bulk enrollment`).
4. Run `pnpm lint` before opening a PR.
5. Open a PR against `staging` with a short description of what changed and why.


