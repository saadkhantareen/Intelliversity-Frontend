import { Link, useSearchParams } from "react-router-dom";
import { useAcademicYears } from "../../academic-year/hooks/useAcademicYears";
import TermTable from "../components/TermTable";
import { useTerms } from "../hooks/useTerms";

const TermList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAcademicYearId = searchParams.get("academicYear") ?? "";
  const {
    academicYears,
    isLoading: isLoadingAcademicYears,
    error: academicYearsError,
  } = useAcademicYears();
  const {
    terms,
    isLoading: isLoadingTerms,
    error: termsError,
    activatingId,
    deletingId,
    activateTerm,
    deleteTerm,
  } = useTerms();

  const handleAcademicYearFilter = (event) => {
    const { value } = event.target;
    setSearchParams(value ? { academicYear: value } : {});
  };

  const handleActivate = async (id) => {
    try {
      await activateTerm(id);
    } catch {
      // The hook exposes a readable request error in the page-level alert.
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this term?")) return;

    try {
      await deleteTerm(id);
    } catch {
      // The hook exposes a readable request error in the page-level alert.
    }
  };

  const addTermHref = selectedAcademicYearId
    ? `/academics/terms/create?academicYear=${selectedAcademicYearId}`
    : "/academics/terms/create";
  const error = termsError || academicYearsError;

  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="terms-title"
    >
      <header className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
            Academic setup
          </p>
          <h1
            id="terms-title"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Terms
          </h1>
          <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-6 text-slate-500">
            Configure term periods, fee milestones, faculty assignments, and
            student registration dates.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-blue-800 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 motion-reduce:transition-none sm:w-auto"
          to={addTermHref}
        >
          Add term
        </Link>
      </header>

      {error && (
        <p
          className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mb-4 flex justify-stretch sm:justify-end">
        <label
          className="grid w-full gap-1.5 text-[0.8125rem] font-semibold text-slate-700 sm:w-auto"
          htmlFor="terms-academic-year-filter"
        >
          <span>Academic year</span>
          <select
            id="terms-academic-year-filter"
            value={selectedAcademicYearId}
            onChange={handleAcademicYearFilter}
            disabled={isLoadingAcademicYears}
            className="min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[0.9375rem] font-normal text-slate-800 outline-none transition-colors duration-150 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 motion-reduce:transition-none sm:min-w-[244px]"
          >
            <option value="">All academic years</option>
            {academicYears.map((academicYear) => (
              <option key={academicYear.id} value={academicYear.id}>
                {academicYear.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {isLoadingTerms ? (
          <div
            className="grid min-h-[180px] place-content-center px-8 py-8 text-sm text-slate-500"
            role="status"
          >
            Loading terms…
          </div>
        ) : (
          <TermTable
            terms={terms}
            activatingId={activatingId}
            deletingId={deletingId}
            onActivate={handleActivate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  );
};

export default TermList;
