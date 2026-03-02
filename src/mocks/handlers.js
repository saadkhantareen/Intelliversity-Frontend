/**
 * MSW v2 mock handlers — intercepts API calls during development.
 *
 * Mock data:
 *   - Tenants "nust" and "comsats" are registered
 *   - Any email/password is accepted
 *   - Platform login → super_admin role (single)
 *   - Tenant login  → ["student", "teacher", "admin"] (multi-role, tests role picker)
 *   - Tenant login with email containing "single" → ["student"] only
 */
import { http, HttpResponse } from 'msw'

const tenants = {
  nust: { id: 1, name: 'NUST', slug: 'nust', logo: '', themeColor: '#2563eb' },
  comsats: { id: 2, name: 'COMSATS', slug: 'comsats', logo: '', themeColor: '#16a34a' },
}

function randomToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// We store the last-logged-in user info so /auth/me/ can return it
let lastUser = null

export const handlers = [
  // ── Resolve tenant ────────────────────────────────────────────
  http.get('*/api/v1/tenants/resolve/', ({ request }) => {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')
    const t = tenants[slug]
    if (!t) {
      return HttpResponse.json({ message: 'Tenant not found' }, { status: 404 })
    }
    return HttpResponse.json(t)
  }),

  // ── Login ─────────────────────────────────────────────────────
  http.post('*/api/v1/auth/login/', async ({ request }) => {
    const body = await request.json()
    const tenantToken = request.headers.get('X-Tenant-Token')
    const isPlatform = !tenantToken

    // Single-role demo: if email contains "single", give one role
    const isSingle = !isPlatform && body.email?.toLowerCase().includes('single')

    const user = {
      id: isPlatform ? 999 : 100,
      name: isPlatform ? 'Platform Admin' : 'Tenant User',
      email: body.email,
      roles: isPlatform
        ? ['super_admin']
        : isSingle
          ? ['student']
          : ['student', 'teacher', 'admin'],
    }

    lastUser = user

    return HttpResponse.json({
      access: `access-${randomToken()}`,
      refresh: `refresh-${randomToken()}`,
      user,
    })
  }),

  // ── Logout ────────────────────────────────────────────────────
  http.post('*/api/v1/auth/logout/', () => {
    lastUser = null
    return new HttpResponse(null, { status: 204 })
  }),

  // ── Token refresh ─────────────────────────────────────────────
  http.post('*/api/v1/auth/token/refresh/', () => {
    return HttpResponse.json({ access: `access-${randomToken()}` })
  }),

  // ── Me (session restore) ──────────────────────────────────────
  http.get('*/api/v1/auth/me/', ({ request }) => {
    const auth = request.headers.get('authorization')
    if (!auth) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }
    // Return last logged-in user, or a default
    const user = lastUser || {
      id: 100,
      name: 'Tenant User',
      email: 'user@example.com',
      roles: ['student'],
    }
    return HttpResponse.json(user)
  }),
]
