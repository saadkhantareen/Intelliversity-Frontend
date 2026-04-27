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


Implication:

## Authentication Storage Contract

Client persistence in `localStorage`:


Current limitations:

## Portal Branding & Page Assets (new model-driven data)

Frontend consumes branding and page-asset records to apply theming and per-page visuals. The backend exposes branding and assets after tenant resolution (Host header -> `UniversityDomain` -> `UniversityPortal`).

### Example `PortalBranding` payload

```json
{
  "id": "uuid",
  "university_portal": "uuid",
  "logo_url": "https://res.cloudinary.com/.../logo.png",
  "logo_public_id": "portfolio/logo_abc123",
  "logo_dark_url": "https://res.cloudinary.com/.../logo-dark.png",
  "favicon_url": "https://res.cloudinary.com/.../favicon.ico",
  "theme_config": {
    "colors": { "primary": "#0057b8", "accent": "#ffd400" },
    "typography": { "fontFamily": "Inter, sans-serif" },
    "borderRadius": "8px",
    "darkMode": false
  }
}
```

Frontend usage:
- Fetch once after tenant/portal is resolved (or included in SSR) and apply `theme_config` + asset URLs.
- Use `logo_public_id` with Cloudinary SDK for on-the-fly transforms if needed.

### Example `PageAsset` payload

```json
{
  "id": "uuid",
  "university_portal": "uuid",
  "page_type": "login",
  "background_image_url": "https://res.cloudinary.com/.../bg-login.jpg",
  "background_image_public_id": "pages/login_bg_abc123",
  "metadata": { "overlayOpacity": 0.5 }
}
```

Frontend usage:
- Load the `background_image_url` and apply any `metadata` (e.g. overlay, position) per page.

### UniversityDomain object (used for routing)

```json
{
  "id": "uuid",
  "domain": "student.fast.localhost",
  "is_primary": true,
  "university_portal": "uuid",
  "ssl_status": "active"
}
```

### Suggested backend API endpoints (informal examples)

- `GET /api/v1/branding/` — returns `PortalBranding` for current tenant+portal (resolved via Host).
- `GET /api/v1/page-assets/` — returns page assets for the current tenant+portal.
- `POST /api/v1/admin/branding/` — admin-only endpoint used by dashboard to upload/change branding.

Notes:
- The frontend expects branding responses to be small JSON objects with `*_url` fields ready to use.
- If the frontend needs transformed images (resized/cropped), use the Cloudinary `public_id` to construct transformed CDN URLs server-side or client-side with the SDK.
