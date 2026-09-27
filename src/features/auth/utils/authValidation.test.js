import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isValidEmail,
  normalizeAuthError,
  validateLoginForm,
} from './authValidation.js';

test('isValidEmail accepts plain and institutional addresses', () => {
  assert.equal(isValidEmail('student@university.edu'), true);
  assert.equal(isValidEmail('staff@campus.example'), true);
  assert.equal(isValidEmail('  spaced@campus.example  '), true);
});

test('isValidEmail rejects malformed input without enforcing .edu', () => {
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidEmail('missing@domain'), false);
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail(undefined), false);
});

test('validateLoginForm requires a valid email and a non-empty password', () => {
  assert.deepEqual(validateLoginForm({ email: '', password: '' }), {
    valid: false,
    errors: {
      email: 'Enter your email address.',
      password: 'Enter your password.',
    },
  });

  assert.deepEqual(validateLoginForm({ email: 'bad', password: 'x' }).errors, {
    email: 'Enter a valid email address.',
  });

  assert.deepEqual(validateLoginForm({ email: ' a@b.co ', password: 'x' }), {
    valid: true,
    errors: {},
  });
});

test('validateLoginForm does not impose an invented password minimum', () => {
  assert.equal(validateLoginForm({ email: 'a@b.co', password: 'abc' }).valid, true);
});

test('normalizeAuthError reads the DRF detail shape', () => {
  const error = { response: { data: { detail: 'Invalid credentials.' } } };
  assert.equal(normalizeAuthError(error), 'Invalid credentials.');
});

test('normalizeAuthError reads detail arrays and nested detail objects', () => {
  assert.equal(
    normalizeAuthError({ response: { data: { detail: [{ detail: 'Portal mismatch.' }] } } }),
    'Portal mismatch.'
  );
});

test('normalizeAuthError reads non_field_errors (reCAPTCHA failures)', () => {
  const error = {
    response: { data: { non_field_errors: ['reCAPTCHA verification failed.'] } },
  };
  assert.equal(normalizeAuthError(error), 'reCAPTCHA verification failed.');
});

test('normalizeAuthError reads field-level errors', () => {
  assert.equal(
    normalizeAuthError({ response: { data: { email: ['Enter a valid email address.'] } } }),
    'Enter a valid email address.'
  );
  assert.equal(
    normalizeAuthError({
      response: { data: { password: [{ detail: 'This field may not be blank.' }] } },
    }),
    'This field may not be blank.'
  );
});

test('normalizeAuthError prefers already-normalised auth errors', () => {
  const error = new Error('Normalised message');
  error.isAuthError = true;
  assert.equal(normalizeAuthError(error), 'Normalised message');
});

test('normalizeAuthError handles network and timeout failures', () => {
  assert.equal(
    normalizeAuthError({ message: 'Network Error' }),
    'We could not reach the server. Check your connection and try again.'
  );
  assert.equal(
    normalizeAuthError({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' }),
    'The request timed out. Check your connection and try again.'
  );
});

test('normalizeAuthError falls back when nothing usable is present', () => {
  assert.equal(normalizeAuthError(null), DEFAULT_FALLBACK);
  assert.equal(normalizeAuthError({ response: { data: {} } }), DEFAULT_FALLBACK);
});

const DEFAULT_FALLBACK =
  'We could not sign you in. Please check your details and try again.';
