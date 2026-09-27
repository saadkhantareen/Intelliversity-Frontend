import { Link } from 'react-router-dom';

const actionButtonClassName =
  'inline-flex min-h-8 items-center justify-center rounded px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none';

const CourseOfferingTable = ({ courseOfferings, deletingId, onDelete }) => {
  if (!courseOfferings.length) {
    return (
      <div className="grid min-h-[180px] place-content-center px-8 py-8 text-center text-sm text-slate-500">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          No course offerings have been added yet.
        </p>
        <span className="text-sm">
          Create an offering to assign a course, term, section, and faculty member.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1140px] w-full border-collapse text-left">
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
              Capacity
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
              Faculty
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
          {courseOfferings.map((courseOffering) => {
            const isDeleting = deletingId === courseOffering.id;
            const courseLabel = [courseOffering.course?.code, courseOffering.course?.name]
              .filter(Boolean)
              .join(' — ');
            const batchSemester = courseOffering.batch?.current_semester
              ? `Semester ${courseOffering.batch.current_semester}`
              : '';

            return (
              <tr
                key={courseOffering.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/30"
              >
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <strong className="block font-semibold text-slate-800">
                    {courseLabel || '—'}
                  </strong>
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {courseOffering.term?.name || '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {courseOffering.capacity ?? '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <strong className="block font-semibold text-slate-800">
                    {courseOffering.batch?.name || '—'}
                  </strong>
                  {batchSemester && (
                    <span className="mt-0.5 block text-[0.8125rem] text-slate-500">
                      {batchSemester}
                    </span>
                  )}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {courseOffering.section?.name || '—'}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {courseOffering.faculty?.name || 'Unassigned'}
                </td>
                <td className="px-[18px] py-4 text-right">
                  <div className="flex justify-end gap-0.5 whitespace-nowrap">
                    <Link
                      className={actionButtonClassName}
                      to={`/enrollments/course-offerings/edit/${courseOffering.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className={`${actionButtonClassName} text-red-700 hover:bg-red-50 hover:text-red-800`}
                      type="button"
                      onClick={() => onDelete(courseOffering.id)}
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

export default CourseOfferingTable;
