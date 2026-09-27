import {
  ENROLLMENT_STATUS_OPTIONS,
  getCourseOfferingLabel,
  getProfileLabel,
} from '../utils/enrollmentRelations.utils';

const inputClassName =
  'min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[0.9375rem] font-normal text-slate-800 outline-none transition-colors duration-150 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 motion-reduce:transition-none';

const fieldLabelClassName = 'grid gap-1.5 text-[0.8125rem] font-semibold text-slate-700';

const EnrollmentFormFields = ({ values, courseOfferings, students, onChange, disabled }) => {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      <label
        className={`${fieldLabelClassName} sm:col-span-2`}
        htmlFor="enrollment-course-offering"
      >
        <span>Course offering</span>
        <select
          id="enrollment-course-offering"
          name="course_offering"
          value={values.course_offering}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        >
          <option value="">Select a course offering</option>
          {courseOfferings.map((courseOffering) => (
            <option key={courseOffering.id} value={courseOffering.id}>
              {getCourseOfferingLabel(courseOffering)}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabelClassName} htmlFor="enrollment-student">
        <span>Student</span>
        <select
          id="enrollment-student"
          name="student_id"
          value={values.student_id}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {getProfileLabel(student)}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabelClassName} htmlFor="enrollment-status">
        <span>Enrollment status</span>
        <select
          id="enrollment-status"
          name="status"
          value={values.status}
          onChange={onChange}
          required
          disabled={disabled}
          className={inputClassName}
        >
          {ENROLLMENT_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default EnrollmentFormFields;
