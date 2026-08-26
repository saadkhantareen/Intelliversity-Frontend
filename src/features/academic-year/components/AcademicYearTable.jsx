import { Link } from 'react-router-dom';
import { formatDate } from '../utils/academicYear.utils';

const actionButtonClassName =
  'inline-flex min-h-8 items-center justify-center rounded px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none';

const AcademicYearTable = ({ academicYears, activatingId, deletingId, onActivate, onDelete }) => {
  if (!academicYears.length) {
    return (
      <div className="grid min-h-[180px] place-content-center px-8 py-8 text-center text-sm text-slate-500">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          No academic years have been added yet.
        </p>
        <span className="text-sm">Create an academic year before configuring its terms.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Academic year
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Start date
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              End date
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Status
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-center text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {academicYears.map((academicYear) => {
            const isActivating = activatingId === academicYear.id;
            const isDeleting = deletingId === academicYear.id;

            return (
              <tr
                key={academicYear.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/30"
              >
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <strong className="block font-semibold text-slate-800">
                    {academicYear.name}
                  </strong>
                </td>
                <td className="px-[18px] py-4 text-sm leading-5 text-slate-600">
                  {formatDate(academicYear.start_date)}
                </td>
                <td className="px-[18px] py-4 text-sm leading-5 text-slate-600">
                  {formatDate(academicYear.end_date)}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <span
                    className={`inline-flex min-h-6 items-center rounded-full px-2 py-[3px] text-xs font-bold ${
                      academicYear.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {academicYear.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-[18px] py-4 text-right">
                  <div className="flex justify-center gap-0.5 whitespace-nowrap">
                    <Link
                      className={actionButtonClassName}
                      to={`/academics/terms?academicYear=${academicYear.id}`}
                    >
                      Terms
                    </Link>
                    <Link
                      className={actionButtonClassName}
                      to={`/academics/academic-years/edit/${academicYear.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className={`${actionButtonClassName} text-red-700 hover:bg-red-50 hover:text-red-800`}
                      type="button"
                      onClick={() => onDelete(academicYear.id)}
                      disabled={isActivating || isDeleting}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                    {!academicYear.is_active && (
                      <button
                        className={`${actionButtonClassName} text-blue-700`}
                        type="button"
                        onClick={() => onActivate(academicYear.id)}
                        disabled={isActivating || isDeleting}
                      >
                        {isActivating ? 'Activating…' : 'Set active'}
                      </button>
                    )}
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

export default AcademicYearTable;
