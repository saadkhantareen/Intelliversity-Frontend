import { getBatchLabel, getCourseLabel, getFacultyLabel } from '../utils/courseOffering.utils';

const inputClassName =
  'min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[0.9375rem] font-normal text-slate-800 outline-none transition-colors duration-150 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 motion-reduce:transition-none';

const fieldLabelClassName = 'grid gap-1.5 text-[0.8125rem] font-semibold text-slate-700';

const CourseOfferingFormFields = ({
  values,
  courses,
  terms,
  batches,
  sections,
  faculties,
  onChange,
  disabled,
  isLoadingSections,
}) => {
  const isSectionDisabled = disabled || !values.batch_id || isLoadingSections;
  const sectionPlaceholder = !values.batch_id
    ? 'Select a batch first'
    : isLoadingSections
      ? 'Loading sections…'
      : 'Select a section';

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      <label className={`${fieldLabelClassName} sm:col-span-2`} htmlFor="course-offering-course">
        <span>Course</span>
        <select
          id="course-offering-course"
          name="course_id"
          value={values.course_id}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {getCourseLabel(course)}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabelClassName} htmlFor="course-offering-term">
        <span>Term</span>
        <select
          id="course-offering-term"
          name="term_id"
          value={values.term_id}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        >
          <option value="">Select a term</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabelClassName} htmlFor="course-offering-capacity">
        <span>Capacity</span>
        <input
          id="course-offering-capacity"
          name="capacity"
          type="number"
          min="1"
          step="1"
          value={values.capacity}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        />
      </label>

      <label className={fieldLabelClassName} htmlFor="course-offering-faculty">
        <span>Faculty member (optional)</span>
        <select
          id="course-offering-faculty"
          name="faculty_id"
          value={values.faculty_id}
          onChange={onChange}
          disabled={disabled}
          className={inputClassName}
        >
          <option value="">Select a faculty member</option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {getFacultyLabel(faculty)}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabelClassName} htmlFor="course-offering-batch">
        <span>Batch</span>
        <select
          id="course-offering-batch"
          name="batch_id"
          value={values.batch_id}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        >
          <option value="">Select a batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {getBatchLabel(batch)}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabelClassName} htmlFor="course-offering-section">
        <span>Section</span>
        <select
          id="course-offering-section"
          name="section_id"
          value={values.section_id}
          onChange={onChange}
          required
          disabled={isSectionDisabled}
          className={inputClassName}
        >
          <option value="">{sectionPlaceholder}</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
        <span className="text-xs font-normal leading-4 text-slate-500">
          Sections are loaded for the selected batch.
        </span>
      </label>
    </div>
  );
};

export default CourseOfferingFormFields;
