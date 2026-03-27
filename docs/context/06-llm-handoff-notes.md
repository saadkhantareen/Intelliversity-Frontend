# LLM Handoff Notes

This file provides practical guidance for external LLMs consuming this repository context.

## Canonical Architecture Summary

- SPA built with React + React Router.
- Main domain implemented: auth and password recovery.
- Tenant awareness comes from browser hostname subdomain.
- Authentication state is localStorage-backed and context-driven.

## Key Assumptions External Models Should Respect

1. Tenant is inferred client-side from host (`portal.university.domain`).
2. Backend host must mirror frontend host with port switch to `8000`.
3. Error payloads may be nested and include `detail` fields.
4. `DashboardPage` and `NotFound` are placeholders, not feature-complete modules.

## Known Gaps (Do Not Misinterpret as Bugs Without Product Decision)

- No token refresh strategy in frontend service layer.
- No centralized Axios auth header attachment in visible code.
- Limited route surface (mostly auth-related).
- Root `README.md` is generic Vite template and not project-specific.

## Suggested Prompt Prefix for External LLMs

Use the following instruction style when asking an external model:

"You are analyzing the Intelliversity frontend. Read docs/context in order from `00-context-index.md` through `09-known-inconsistencies-and-risks.md` before proposing changes. Preserve existing architecture: React Router route graph, TenantContext hostname detection, AuthContext localStorage contract, and auth.service endpoint paths. Prefer minimal, surgical edits aligned with current patterns."

## Minimal Domain Vocabulary

- Tenant: portal + university identity derived from subdomain.
- Portal: one of `student`, `teacher`, `admin`.
- Auth session: localStorage access/refresh tokens + serialized user object.
- Protected route: route blocked unless `isAuthenticated`.

## If You Need to Extend the App

When extending features, keep these invariants stable unless explicitly refactoring:

- Provider order in `main.jsx`.
- Route guarding via `ProtectedRoute`.
- API path prefix `/api/v1/accounts/` for auth endpoints.
- Tenant-aware backend URL derivation strategy.
