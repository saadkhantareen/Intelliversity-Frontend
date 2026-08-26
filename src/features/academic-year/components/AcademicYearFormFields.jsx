const inputClassName =
  'min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[0.9375rem] font-normal text-slate-800 outline-none transition-colors duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 motion-reduce:transition-none';

const AcademicYearFormFields = ({ values, onChange, disabled }) => {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      <label
        className="grid gap-1.5 text-[0.8125rem] font-semibold text-slate-700 sm:col-span-2"
        htmlFor="academic-year-name"
      >
        <span>Academic year name</span>
        <input
          id="academic-year-name"
          name="name"
          type="text"
          value={values.name}
          onChange={onChange}
          placeholder="e.g. Academic Year 2026–27"
          autoComplete="off"
          required
          disabled={disabled}
          className={inputClassName}
        />
      </label>

      <label
        className="grid gap-1.5 text-[0.8125rem] font-semibold text-slate-700"
        htmlFor="academic-year-start-date"
      >
        <span>Start date</span>
        <input
          id="academic-year-start-date"
          name="start_date"
          type="date"
          value={values.start_date}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        />
      </label>

      <label
        className="grid gap-1.5 text-[0.8125rem] font-semibold text-slate-700"
        htmlFor="academic-year-end-date"
      >
        <span>End date</span>
        <input
          id="academic-year-end-date"
          name="end_date"
          type="date"
          value={values.end_date}
          onChange={onChange}
          min={values.start_date || undefined}
          required
          disabled={disabled}
          className={inputClassName}
        />
      </label>
    </div>
  );
};

export default AcademicYearFormFields;
