import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAcademicYears } from '../../academic-year/hooks/useAcademicYears';
import TermFormFields from '../components/TermFormFields';
import { useTerm } from '../hooks/useTerm';
import { validateTermDates } from '../utils/term.utils';

const TermForm = () => {
  const { id: termId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(termId);
  const defaultAcademicYearId = searchParams.get('academicYear') ?? '';
  const {
    academicYears,
    isLoading: isLoadingAcademicYears,
    error: academicYearsError,
  } = useAcademicYears();
  const { values, setValues, isLoading, isSaving, error, saveTerm } = useTerm(
    termId,
    defaultAcademicYearId
  );
  const [validationError, setValidationError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dateError = validateTermDates(values);
    if (dateError) {
      setValidationError(dateError);
      return;
    }

    try {
      await saveTerm(values);
      navigate(
        values.academic_year
          ? `/academics/terms?academicYear=${values.academic_year}`
          : '/academics/terms'
      );
    } catch {
      // The hook supplies a user-facing request error.
    }
  };

  if (isLoading || isLoadingAcademicYears) {
    return (
      <section className="mx-auto w-full max-w-[860px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div
          className="grid min-h-[180px] place-content-center px-8 py-8 text-sm text-slate-500"
          role="status"
        >
          Loading term details…
        </div>
      </section>
    );
  }

  const formError = validationError || error || academicYearsError;
  const hasAcademicYears = academicYears.length > 0;

  return (
    <section
      className="mx-auto w-full max-w-[860px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="term-form-title"
    >
      <header className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Academic setup
        </p>
        <h1
          id="term-form-title"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          {isEditMode ? 'Edit term' : 'Add term'}
        </h1>
        <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-6 text-slate-500">
          {isEditMode
            ? 'Update the term schedule and operational deadlines.'
            : 'Build a complete operational calendar for an academic year.'}
        </p>
      </header>

      <form
        className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 sm:p-7"
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && (
          <p
            className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
            role="alert"
          >
            {formError}
          </p>
        )}

        {!hasAcademicYears && !academicYearsError && (
          <p
            className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
            role="alert"
          >
            Add an academic year before creating a term.
          </p>
        )}

        <TermFormFields
          values={values}
          academicYears={academicYears}
          onChange={handleChange}
          disabled={isSaving || !hasAcademicYears}
        />

        <footer className="mt-8 flex flex-col-reverse gap-2.5 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 motion-reduce:transition-none"
            to="/academics/terms"
          >
            Cancel
          </Link>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-blue-800 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            type="submit"
            disabled={isSaving || !hasAcademicYears}
          >
            {isSaving ? 'Saving…' : isEditMode ? 'Save changes' : 'Create term'}
          </button>
        </footer>
      </form>
    </section>
  );
};

export default TermForm;
