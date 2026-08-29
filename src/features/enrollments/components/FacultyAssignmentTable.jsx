import { Link } from 'react-router-dom';
import {
  FACULTY_ASSIGNMENT_STATUS_OPTIONS,
  getStatusClassName,
  getStatusLabel,
} from '../utils/enrollmentRelations.utils';

const actionButtonClassName =
  'inline-flex min-h-8 items-center justify-center rounded px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none';

const FacultyAssignmentTable = ({
  facultyAssignments,
  deletingId,
  onDelete,
}) => {
  if (!facultyAssignments.length) {
    return (
      <div className="grid min-h-[180px] place-content-center px-8 py-8 text-center text-sm text-slate-500">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          No faculty assignments have been added yet.
        </p>
        <span className="text-sm">
          Assign a faculty member to a course offering to begin the approval workflow.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1080px] w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Course
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Term
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Batch
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Section
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Faculty member
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
          {facultyAssignments.map((facultyAssignment) => {
            const isDeleting = deletingId === facultyAssignment.id;

            return (
              <tr
                key={facultyAssignment.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/30"
              >
                <td className="max-w-[410px] px-[18px] py-4 text-sm leading-5 text-slate-700">
                  {facultyAssignment.course_name || '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {facultyAssignment.term_name || '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {facultyAssignment.batch_name || '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {facultyAssignment.section_name || '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {facultyAssignment.faculty_name || '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <span
                    className={`inline-flex min-h-6 items-center rounded-full px-2 py-[3px] text-xs font-bold ${getStatusClassName(
                      facultyAssignment.status
                    )}`}
                  >
                    {getStatusLabel(facultyAssignment.status, FACULTY_ASSIGNMENT_STATUS_OPTIONS)}
                  </span>
                </td>
                <td className="px-[18px] py-4 text-right">
                  <div className="flex justify-end gap-0.5 whitespace-nowrap">
                    <Link
                      className={actionButtonClassName}
                      to={`/enrollments/faculty-assignments/edit/${facultyAssignment.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className={`${actionButtonClassName} text-red-700 hover:bg-red-50 hover:text-red-800`}
                      type="button"
                      onClick={() => onDelete(facultyAssignment.id)}
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

export default FacultyAssignmentTable;
