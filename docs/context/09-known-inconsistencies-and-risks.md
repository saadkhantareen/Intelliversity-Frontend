# Known Inconsistencies and Risks

This file helps external LLMs avoid incorrect assumptions while editing code.

## 1) Portal Naming Inconsistency

Observed mismatch:

- `TenantContext` accepts: `student`, `teacher`, `admin`
- `App.jsx` checks: `admin`, `faculty`, default to student
- `FacultyLayout` label uses `faculty`

Risk:

- A tenant resolved as `teacher` may not map to expected faculty layout logic.

Recommendation for future refactor:

- Standardize portal key naming (`teacher` vs `faculty`) across tenant detection, route layout switching, and backend payloads.

## 2) Navigation Links Ahead of Route Definitions

Observed:

- Portal configs include many links (`/courses`, `/students`, `/settings`, etc.).
- `App.jsx` currently declares only auth routes + `/dashboard` + `*`.

Risk:

- Sidebar navigation can drive users into `NotFound` for not-yet-implemented pages.

## 3) Auth Token Lifecycle Is Partial

Observed:

- Tokens are persisted on login.
- No refresh strategy or interceptor handling is present.

Risk:

- Long-lived sessions may fail after access token expiry without graceful recovery.

## 4) API Client Does Not Inject Auth Header Centrally

Observed:

- Axios instance is configured with `baseURL` only.
- No request interceptor attaches bearer token globally.

Risk:

- New protected endpoints may fail unless each request manually sends auth headers.

## 5) Empty/Placeholder Modules Exist

Observed:

- `src/components/layout/PortalLayouts.jsx` exists but is empty.
- `DashboardPage` and `NotFound` are minimal placeholders.

Risk:

- External models may overestimate implementation completeness.

## Guidance for External LLM Changes

When proposing code changes:

- Preserve current contracts first.
- Call out whether a change is a bug fix or a structural refactor.
- If standardizing naming, update all affected modules in one consistent pass.
