/**
 * Pure, dependency-free helpers shared by the login page and AuthContext.
 *
 * Kept free of React / import.meta so they can be unit tested directly with
 * Node's built-in test runner (`node --test src/features/auth/utils`).
 */

/**
 * Basic email shape check.
 *
 * Intentionally does NOT require a `.edu` suffix: the current API contract
 * (`LoginSerializer.email = EmailField`) accepts any valid address and a tenant
 * may legitimately use a non-`.edu` domain.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim());
}

/**
 * Validate the login form on submit.
 *
 * Password rule is "non-empty" only. The previous draft required 8+ characters,
 * which is a design assumption, not a verified backend rule — real accounts may
 * have shorter passwords and password policy belongs to the server / reset flow.
 */
export function validateLoginForm({ email, password } = {}) {
  const trimmedEmail = String(email ?? '').trim();
  const errors = {};

  if (!trimmedEmail) {
    errors.email = 'Enter your email address.';
  } else if (!isValidEmail(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Enter your password.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

const DEFAULT_AUTH_ERROR =
  'We could not sign you in. Please check your details and try again.';

/** Recursively pull the first human-readable string out of a DRF error value. */
function pickMessage(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = pickMessage(item);
      if (message) return message;
    }
    return '';
  }
  if (typeof value === 'object') {
    return (
      pickMessage(value.detail) ||
      pickMessage(value.message) ||
      pickMessage(value.non_field_errors) ||
      ''
    );
  }
  return '';
}

/**
 * Normalise any thrown auth error into a single inline-safe message.
 *
 * Handles the response shapes the current API actually returns:
 *   - { detail: "Invalid credentials." }
 *   - { non_field_errors: ["reCAPTCHA failed"] }
 *   - { email: [...] } / { password: [...] } / { recaptcha_token: [...] }
 *   - plain strings / arrays, plus network + timeout failures.
 */
export function normalizeAuthError(error, fallback = DEFAULT_AUTH_ERROR) {
  if (!error) return fallback;

  // Errors re-thrown by AuthContext are already normalised.
  if (error.isAuthError && typeof error.message === 'string' && error.message) {
    return error.message;
  }

  const data = error.response?.data;
  const message =
    pickMessage(data?.detail) ||
    pickMessage(data?.non_field_errors) ||
    pickMessage(data?.recaptcha_token) ||
    pickMessage(data?.email) ||
    pickMessage(data?.password) ||
    pickMessage(data);

  if (message) return message;

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Check your connection and try again.';
  }

  if (error.message === 'Network Error') {
    return 'We could not reach the server. Check your connection and try again.';
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
