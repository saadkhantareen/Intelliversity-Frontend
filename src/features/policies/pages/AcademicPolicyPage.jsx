import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAcademicPolicy,
  patchAcademicPolicy,
} from '../api/academic-policy.service';

const EMPTY_POLICY = {
  min_credits_per_term: '',
  max_credits_per_term: '',
};

const toFormValues = (policy = {}) => ({
  min_credits_per_term: policy.min_credits_per_term ?? '',
  max_credits_per_term: policy.max_credits_per_term ?? '',
});

const toPayload = (values) => ({
  min_credits_per_term: Number(values.min_credits_per_term),
  max_credits_per_term: Number(values.max_credits_per_term),
});

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data && typeof data === 'object') return Object.values(data).flat().join(' ');
  return 'Something went wrong. Please try again.';
};

const validate = (values) => {
  const errors = {};
  const min = Number(values.min_credits_per_term);
  const max = Number(values.max_credits_per_term);

  if (values.min_credits_per_term === '') {
    errors.min_credits_per_term = 'Enter the minimum credits allowed.';
  } else if (!Number.isInteger(min) || min < 0) {
    errors.min_credits_per_term = 'Use a whole number greater than or equal to 0.';
  }

  if (values.max_credits_per_term === '') {
    errors.max_credits_per_term = 'Enter the maximum credits allowed.';
  } else if (!Number.isInteger(max) || max < 0) {
    errors.max_credits_per_term = 'Use a whole number greater than or equal to 0.';
  }

  if (!errors.min_credits_per_term && !errors.max_credits_per_term && min > max) {
    errors.max_credits_per_term = 'Maximum credits must be greater than or equal to minimum credits.';
  }

  return errors;
};

function Field({ id, label, hint, value, onChange, error, disabled }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold leading-5 text-slate-800">
        {label}
      </label>
      <p id={hintId} className="mb-3 min-h-0 text-[13px] leading-6 text-slate-500 sm:min-h-[48px]">
        {hint}
      </p>
      <div className={`flex items-center border bg-white transition focus-within:border-sky-700 focus-within:ring-4 focus-within:ring-sky-700/10 ${error ? 'border-red-700' : 'border-slate-300'}`}>
        <input
          id={id}
          name={id}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hintId}
          disabled={disabled}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span aria-hidden="true" className="pr-3 text-[13px] text-slate-500">
          credits
        </span>
      </div>
      {error && <p id={errorId} className="mt-2 text-[13px] leading-5 text-red-800" role="alert">{error}</p>}
    </div>
  );
}

export default function AcademicPoliciesPage() {
  const [values, setValues] = useState(EMPTY_POLICY);
  const [savedValues, setSavedValues] = useState(EMPTY_POLICY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('loading');
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(savedValues),
    [savedValues, values],
  );

  const loadPolicy = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const policy = toFormValues(await getAcademicPolicy());
      setValues(policy);
      setSavedValues(policy);
      setLastSavedAt(new Date());
      setStatus('ready');
    } catch (error) {
      setStatus('error');
      setErrorMessage(getErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, max_credits_per_term: undefined }));
    setNotice('');
  };

  const handleReset = () => {
    setValues(savedValues);
    setErrors({});
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setNotice('');
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('saving');
    setErrorMessage('');
    try {
      const responsePolicy = await patchAcademicPolicy(toPayload(values));
      const savedPolicy = responsePolicy ? toFormValues(responsePolicy) : toFormValues(values);
      setValues(savedPolicy);
      setSavedValues(savedPolicy);
      setLastSavedAt(new Date());
      setNotice('Academic policies saved successfully.');
      setStatus('ready');
    } catch (error) {
      setStatus('ready');
      setErrorMessage(getErrorMessage(error));
    }
  };

  const isBusy = status === 'loading' || status === 'saving';

  if (status === 'loading') {
    return <main className="grid min-h-[360px] place-items-center px-4 py-10 text-sm text-slate-500">Loading academic policies…</main>;
  }

  if (status === 'error') {
    return (
      <main className="grid min-h-[360px] place-items-center px-4 py-10 text-center">
        <div className="max-w-[480px]">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.11em] text-slate-500">Policies</p>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-slate-900">Academic policies</h1>
          <p className="mb-3 text-[15px] leading-6 text-slate-500">We couldn’t load the current academic policies.</p>
          <p className="mb-5 text-[13px] leading-5 text-red-800" role="alert">{errorMessage}</p>
          <button type="button" onClick={loadPolicy} className="min-h-[42px] rounded-sm border border-sky-800 bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-sky-900 hover:bg-sky-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-700/25">
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[960px] px-[18px] py-7 text-slate-900 sm:px-8 sm:py-10">
      <header className="block border-b border-slate-200 pb-6 sm:flex sm:items-start sm:justify-between sm:gap-8 sm:pb-8">
        <div>
          <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.11em] text-slate-500">Policies</p>
          <h1 className="mb-3 text-[clamp(28px,4vw,38px)] font-semibold leading-tight tracking-tight text-slate-900">Academic policies</h1>
          <p className="mb-0 max-w-[620px] text-[15px] leading-7 text-slate-500">Set the credit limits that define a student’s permitted course load for each academic term.</p>
        </div>
        <div className="flex items-center gap-2.5 pt-[18px] text-[13px] text-slate-500 sm:flex-none sm:pt-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-600" />
          <span>Singleton policy record</span>
        </div>
      </header>

      <section className="mt-6 border border-slate-200 bg-white sm:mt-8" aria-labelledby="credit-policy-title">
        <div className="border-b border-slate-200 px-[18px] py-[22px] sm:px-7 sm:py-6">
          <h2 id="credit-policy-title" className="mb-1.5 text-lg font-semibold text-slate-900">Term credit limits</h2>
          <p className="mb-0 text-sm leading-6 text-slate-500">These limits apply to course registration across the institution.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-[18px] sm:p-7">
          <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 sm:gap-6">
            <Field id="min_credits_per_term" label="Minimum credits per term" hint="The smallest course load a student may register for." value={values.min_credits_per_term} onChange={handleChange} error={errors.min_credits_per_term} disabled={isBusy} />
            <Field id="max_credits_per_term" label="Maximum credits per term" hint="The largest course load a student may register for." value={values.max_credits_per_term} onChange={handleChange} error={errors.max_credits_per_term} disabled={isBusy} />
          </div>

          <div className="mt-7 block border-t border-slate-200 pt-5 sm:mt-9 sm:flex sm:items-end sm:justify-between sm:gap-6">
            <div aria-live="polite">
              {notice && <p className="m-0 text-[13px] leading-5 text-emerald-700">{notice}</p>}
              {errorMessage && <p className="m-0 text-[13px] leading-5 text-red-800">{errorMessage}</p>}
              {!notice && !errorMessage && lastSavedAt && <p className="m-0 text-[13px] leading-5 text-slate-500">Last loaded {lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2.5 sm:mt-0">
              <button type="button" onClick={handleReset} disabled={!isDirty || isBusy} className="min-h-[42px] flex-1 rounded-sm border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-700/25 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">Discard changes</button>
              <button type="submit" disabled={!isDirty || isBusy} className="min-h-[42px] flex-1 rounded-sm border border-sky-800 bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-sky-900 hover:bg-sky-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-700/25 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">{status === 'saving' ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
