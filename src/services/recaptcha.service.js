const SITE_KEY = '6Lcad4ssAAAAALJoEgeBdGyDwAtLLoSqB6H3yiI0'

export const getRecaptchaToken = (action) => {
    return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
            window.grecaptcha
                .execute(SITE_KEY, { action })
                .then(resolve)
                .catch(reject)
        })
    })
}