# Runtime State and Storage

## Global State Sources

Runtime state is currently split across two React context providers:

- `TenantContext` (`src/context/TenantContext.jsx`)
- `AuthContext` (`src/context/AuthContext.jsx`)

There is no Redux/Zustand/global query cache in current code.

## Tenant State Lifecycle

### Detection

- Runs once in `TenantProvider` mount effect.
- Reads `window.location.hostname` and splits by `.`.
- Uses first segment as portal and second as university.

### Exposed Tenant State

- `portal`
- `university`
- `config` (portal label/color)
- `isValid`
- `isResolved`

### Implication for Consumers

- Components should assume tenant fields can be `null` on initial render.
- Rendering that depends on tenant information should be defensive (`config?.color`, `config?.label`).

## Auth State Lifecycle

### Initialization

- On mount, `AuthProvider` reads:
  - `localStorage.access_token`
  - `localStorage.user`
- If both exist, provider marks user authenticated.

### Login Path

`login(credentials)`:

1. Calls `authService.login`.
2. Persists `access_token`, `refresh_token`, `user`.
3. Updates in-memory auth state.
4. Emits success toast.

### Logout Path

`logout()`:

1. Removes auth keys from localStorage.
2. Clears in-memory auth state.
3. Emits success toast.

## Persistence Contract

Current localStorage keys:

- `access_token`
- `refresh_token`
- `user` (JSON string)

Current behavior does not include:

- Token refresh scheduling
- Axios response interceptor for 401 recovery
- Token expiry pre-check before protected render

## Auth Guard Semantics

`ProtectedRoute` behavior:

- Shows loading UI while auth provider is loading.
- Redirects unauthenticated users to `/login`.
- Renders nested route tree for authenticated users.

## Mutation Ownership

- Pages call service/context actions.
- Context is source of truth for session state.
- UI notifications for auth operations are emitted from context/page layer (not service layer).