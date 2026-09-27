const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const EXECUTE_TIMEOUT_MS = 10000;

export const isRecaptchaConfigured = () => Boolean(SITE_KEY);

/**
 * Resolve a reCAPTCHA v3 token for an action.
 *
 * Rejects with a human-readable Error instead of hanging or sending a bogus
 * token when:
 *   - the site key is missing (env not configured)
 *   - the grecaptcha script is blocked / still loading
 *   - execute() rejects (key mismatch, bad domain, network)
 *   - the whole flow exceeds the timeout (no deadlocked submit button)
 */
export const getRecaptchaToken = (action) => {
  return new Promise((resolve, reject) => {
    if (!SITE_KEY) {
      reject(new Error('Security verification is not configured for this portal.'));
      return;
    }

    if (typeof window === 'undefined' || typeof window.grecaptcha?.ready !== 'function') {
      reject(
        new Error('Security verification is still loading. Refresh the page and try again.')
      );
      return;
    }

    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('Security verification timed out. Please try again.'));
    }, EXECUTE_TIMEOUT_MS);

    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      handler(value);
    };

    try {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(SITE_KEY, { action })
          .then((token) => {
            if (!token) {
              finish(reject, new Error('Security verification failed. Please try again.'));
              return;
            }
            finish(resolve, token);
          })
          .catch(() =>
            finish(reject, new Error('Security verification failed. Please try again.'))
          );
      });
    } catch {
      finish(reject, new Error('Security verification failed. Please try again.'));
    }
  });
};

