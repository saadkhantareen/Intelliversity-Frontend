const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const getRecaptchaToken = (action) => {
  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(reject);
    });
  });
};
