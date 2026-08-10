# Routing and User Flows

## Route Table (`src/App.jsx`)

Public routes:

- `/login` -> `LoginPage`
- `/forgot-password` -> `ForgotPasswordPage`
- `/reset-password/:uidb64/:token` -> `ResetPasswordPage`

Protected route wrapper:

- `/dashboard` -> `DashboardPage` (inside `ProtectedRoute`)

Catch-all:

- `*` -> `NotFound`

## User Flow 1: Login

Entry: `/login`

1. User enters `email` + `password`.
2. Form submits to `useAuth().login`.
3. On success, tokens/user persist to localStorage.
4. User is navigated to `/dashboard`.
5. Dashboard access is allowed by `ProtectedRoute`.

Failure behavior:

- Error toast is handled inside `AuthContext.login`.

## User Flow 2: Forgot Password

Entry: `/forgot-password`

1. User submits email.
2. Page calls `authService.forgotPassword({ email })`.
3. On success, local UI switches to submitted confirmation state.
4. User can navigate back to `/login`.

Failure behavior:

- Extracts backend error from `err.response.data` and shows toast.

## User Flow 3: Reset Password

Entry: `/reset-password/:uidb64/:token`

1. Route params (`uidb64`, `token`) read via `useParams()`.
2. User submits `newPassword` and `confirmPassword`.
3. Page calls `authService.resetPassword(uidb64, token, payload)`.
4. On success, success toast appears and user is redirected to `/login`.

Failure behavior:

- Error mapping from common backend fields (`detail`, `non_field_errors`, `new_password`) to toast.

## Route Access Control Summary

- Authenticated state relies on `AuthContext`.
- Initial auth hydration happens from localStorage on mount.
- `ProtectedRoute` blocks protected UI when no authenticated session exists.
