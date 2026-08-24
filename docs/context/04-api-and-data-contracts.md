# API and Data Contracts

## Transport Layer

- HTTP client: Axios instance from `src/services/api.js`
- Base URL: same protocol + same hostname + port `8000`
- Example when frontend runs on `student.nust.localhost:5173`:
  - backend target: `student.nust.localhost:8000`

## Auth Endpoints Used

### 1) Login

- Method: `POST`
- Path: `/api/v1/accounts/login/`
- Request body (frontend sends):

```json
{
  "email": "string",
  "password": "string"
}
```

Expected response shape consumed by frontend:

```json
{
  "tokens": {
    "access": "string",
    "refresh": "string"
  },
  "user": {
    "first_name": "string"
  },
  "university": "string | object"
}
```

Frontend side-effects:

- Stores `tokens.access` -> `access_token`
- Stores `tokens.refresh` -> `refresh_token`
- Stores merged `user + university` -> `user`

### 2) Forgot Password

- Method: `POST`
- Path: `/api/v1/accounts/forgot-password/`
- Request body:

```json
{
  "email": "string"
}
```

Frontend expectation:

- Success does not require payload parsing.
- UI switches to generic success confirmation message.

### 3) Reset Password

- Method: `POST`
- Path: `/api/v1/accounts/reset-password/:uidb64/:token/`
- Request body:

```json
{
  "new_password": "string",
  "confirm_password": "string"
}
```

Frontend expectation:

- Success triggers toast + navigation to `/login`.

## Error Contract Patterns Assumed by Frontend

Error extraction patterns used across auth pages/context:

- `errors.detail`
- `errors.non_field_errors[0].detail`
- `errors.email[0].detail`
- `errors.password[0].detail`
- `errors.new_password[0].detail`

Implication:

- Backend often returns nested objects/arrays with `detail` field.
- If none match, frontend falls back to a generic message.

## Authentication Storage Contract

Client persistence in `localStorage`:

- `access_token`: bearer access token
- `refresh_token`: bearer refresh token
- `user`: stringified JSON user object (contains merged `university`)

Current limitations:

- No automatic token refresh or expiry handling in Axios interceptors.
- No centralized auth header injection shown in current code.
