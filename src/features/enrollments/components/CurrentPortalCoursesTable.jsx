import { getStatusClassName } from "../utils/enrollmentRelations.utils";

const actionButtonClassName =
  "inline-flex min-h-8 items-center justify-center rounded px-2 py-1.5 text-sm font-semibold text-red-700 transition-colors duration-150 hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

const CurrentPortalCoursesTable = ({
  records,
  showFaculty,
  actionId,
  actionLabel,
  actionInProgressLabel,
  emptyTitle,
  emptyDescription,
  onAction,
}) => {
  if (!records.length) {
    return (
      <div className="grid min-h-[168px] place-content-center px-8 py-8 text-center text-sm text-slate-500">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          {emptyTitle}
        </p>
        <span className="text-sm">{emptyDescription}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full border-collapse text-left ${showFaculty ? "min-w-[1010px]" : "min-w-[860px]"}`}
      >
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
            {showFaculty && (
              <th
                scope="col"
                className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
              >
                Faculty
              </th>
            )}
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
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const isActing = actionId === record.id;

            return (
              <tr
                key={record.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/30"
              >
                <td className="max-w-[360px] px-[18px] py-4 text-sm leading-5 text-slate-700">
                  <strong className="block font-semibold text-slate-800">
                    {record.course_name || "—"}
                  </strong>
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {record.term_name || "—"}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {record.batch_name || "—"}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {record.section_name || "—"}
                </td>
                {showFaculty && (
                  <td className="px-[18px] py-4 text-sm text-slate-600">
                    {record.faculty_name || "Not assigned"}
                  </td>
                )}
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <span
                    className={`inline-flex min-h-6 items-center rounded-full px-2 py-[3px] text-xs font-bold ${getStatusClassName(
                      record.status,
                    )}`}
                  >
                    {record.status || "—"}
                  </span>
                </td>
                <td className="px-[18px] py-4 text-right">
                  <button
                    className={actionButtonClassName}
                    type="button"
                    onClick={() => onAction(record.id)}
                    disabled={isActing}
                  >
                    {isActing ? actionInProgressLabel : actionLabel}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CurrentPortalCoursesTable;
