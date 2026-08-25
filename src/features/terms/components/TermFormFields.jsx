import TermFormSection from "./TermFormSection";
import { TERM_TYPE_OPTIONS } from "../utils/term.utils";

const inputClassName =
  "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[0.9375rem] font-normal text-slate-800 outline-none transition-colors duration-150 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 motion-reduce:transition-none";

const fieldLabelClassName =
  "grid gap-1.5 text-[0.8125rem] font-semibold text-slate-700";

const DateField = ({ id, label, name, value, onChange, disabled, min }) => (
  <label className={fieldLabelClassName} htmlFor={id}>
    <span>{label}</span>
    <input
      id={id}
      name={name}
      type="date"
      value={value}
      onChange={onChange}
      min={min || undefined}
      required
      disabled={disabled}
      className={inputClassName}
    />
  </label>
);

const TermFormFields = ({ values, academicYears, onChange, disabled }) => {
  return (
    <div>
      <TermFormSection
        isFirst
        title="Term details"
        description="Choose the academic year and define the core term period."
      >
        <label
          className={`${fieldLabelClassName} sm:col-span-2`}
          htmlFor="term-academic-year"
        >
          <span>Academic year</span>
          <select
            id="term-academic-year"
            name="academic_year"
            value={values.academic_year}
            onChange={onChange}
            required
            disabled={disabled}
            className={inputClassName}
          >
            <option value="">Select an academic year</option>
            {academicYears.map((academicYear) => (
              <option key={academicYear.id} value={academicYear.id}>
                {academicYear.name}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldLabelClassName} htmlFor="term-name">
          <span>Term name</span>
          <input
            id="term-name"
            name="name"
            type="text"
            value={values.name}
            onChange={onChange}
            placeholder="e.g. Fall 2026"
            autoComplete="off"
            required
            disabled={disabled}
            className={inputClassName}
          />
        </label>

        <label className={fieldLabelClassName} htmlFor="term-type">
          <span>Term type</span>
          <select
            id="term-type"
            name="term_type"
            value={values.term_type}
            onChange={onChange}
            required
            disabled={disabled}
            className={inputClassName}
          >
            {TERM_TYPE_OPTIONS.map((termType) => (
              <option key={termType.value} value={termType.value}>
                {termType.label}
              </option>
            ))}
          </select>
        </label>

        <DateField
          id="term-start-date"
          label="Term start date"
          name="start_date"
          value={values.start_date}
          onChange={onChange}
          disabled={disabled}
        />
        <DateField
          id="term-end-date"
          label="Term end date"
          name="end_date"
          value={values.end_date}
          onChange={onChange}
          disabled={disabled}
          min={values.start_date}
        />
      </TermFormSection>

      <TermFormSection
        title="Fee schedule"
        description="Set the date fees become available and the payment deadline."
      >
        <DateField
          id="term-fee-issue-date"
          label="Fee issue date"
          name="fee_issue_date"
          value={values.fee_issue_date}
          onChange={onChange}
          disabled={disabled}
        />
        <DateField
          id="term-fee-deadline"
          label="Fee deadline"
          name="fee_deadline"
          value={values.fee_deadline}
          onChange={onChange}
          disabled={disabled}
          min={values.fee_issue_date}
        />
      </TermFormSection>

      <TermFormSection
        title="Faculty course assignment"
        description="Specify the period in which faculty course assignments can be completed."
      >
        <DateField
          id="term-faculty-assignment-start"
          label="Assignment start date"
          name="faculty_course_assignment_start_date"
          value={values.faculty_course_assignment_start_date}
          onChange={onChange}
          disabled={disabled}
        />
        <DateField
          id="term-faculty-assignment-end"
          label="Assignment end date"
          name="faculty_course_assignment_end_date"
          value={values.faculty_course_assignment_end_date}
          onChange={onChange}
          disabled={disabled}
          min={values.faculty_course_assignment_start_date}
        />
      </TermFormSection>

      <TermFormSection
        title="Course registration"
        description="Set the registration window and final adjustment deadlines for students."
      >
        <DateField
          id="term-registration-start"
          label="Registration start date"
          name="course_registration_start_date"
          value={values.course_registration_start_date}
          onChange={onChange}
          disabled={disabled}
        />
        <DateField
          id="term-registration-end"
          label="Registration end date"
          name="course_registration_end_date"
          value={values.course_registration_end_date}
          onChange={onChange}
          disabled={disabled}
          min={values.course_registration_start_date}
        />
        <DateField
          id="term-drop-deadline"
          label="Course drop deadline"
          name="course_drop_deadline"
          value={values.course_drop_deadline}
          onChange={onChange}
          disabled={disabled}
        />
        <DateField
          id="term-withdraw-deadline"
          label="Course withdrawal deadline"
          name="course_withdraw_deadline"
          value={values.course_withdraw_deadline}
          onChange={onChange}
          disabled={disabled}
        />
      </TermFormSection>
    </div>
  );
};

export default TermFormFields;
