import { Link } from 'react-router-dom';
import {
  ENROLLMENT_STATUS_OPTIONS,
  getCourseOfferingLabel,
  getEntityNameById,
  getProfileLabel,
  getStatusClassName,
  getStatusLabel,
} from '../utils/enrollmentRelations.utils';

const actionButtonClassName =
  'inline-flex min-h-8 items-center justify-center rounded px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none';

const EnrollmentTable = ({ enrollments, courseOfferings, students, deletingId, onDelete }) => {
  if (!enrollments.length) {
    return (
      <div className="grid min-h-[180px] place-content-center px-8 py-8 text-center text-sm text-slate-500">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          No enrollments have been added yet.
        </p>
        <span className="text-sm">
          Enroll a student in a course offering to begin managing their participation.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[840px] w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Course offering
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Student
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Status
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-right text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => {
            const isDeleting = deletingId === enrollment.id;
            const courseOfferingName = getEntityNameById(
              courseOfferings,
              enrollment.course_offering,
              getCourseOfferingLabel
            );
            const studentName = getEntityNameById(students, enrollment.student, getProfileLabel);

            return (
              <tr
                key={enrollment.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/30"
              >
                <td className="max-w-[410px] px-[18px] py-4 text-sm leading-5 text-slate-700">
                  {courseOfferingName}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">{studentName}</td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <span
                    className={`inline-flex min-h-6 items-center rounded-full px-2 py-[3px] text-xs font-bold ${getStatusClassName(
                      enrollment.status
                    )}`}
                  >
                    {getStatusLabel(enrollment.status, ENROLLMENT_STATUS_OPTIONS)}
                  </span>
                </td>
                <td className="px-[18px] py-4 text-right">
                  <div className="flex justify-end gap-0.5 whitespace-nowrap">
                    <Link
                      className={actionButtonClassName}
                      to={`/enrollments/student-enrollments/edit/${enrollment.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className={`${actionButtonClassName} text-red-700 hover:bg-red-50 hover:text-red-800`}
                      type="button"
                      onClick={() => onDelete(enrollment.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EnrollmentTable;
