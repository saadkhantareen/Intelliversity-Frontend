import { Link } from "react-router-dom";
import { formatDate, getTermTypeLabel } from "../utils/term.utils";

const actionButtonClassName =
  "inline-flex min-h-8 items-center justify-center rounded px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

const TermTable = ({
  terms,
  activatingId,
  deletingId,
  onActivate,
  onDelete,
}) => {
  if (!terms.length) {
    return (
      <div className="grid min-h-[180px] place-content-center px-8 py-8 text-center text-sm text-slate-500">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          No terms match the current selection.
        </p>
        <span className="text-sm">
          Add a term to establish the operational dates for an academic year.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1030px] w-full border-collapse text-left">
        <thead>
          <tr>
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
              Academic year
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Term period
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Registration window
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
          {terms.map((term) => {
            const isActivating = activatingId === term.id;
            const isDeleting = deletingId === term.id;

            return (
              <tr
                key={term.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/30"
              >
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <strong className="block font-semibold text-slate-800">
                    {term.name}
                  </strong>
                  <span className="mt-0.5 block text-[0.8125rem] text-slate-500">
                    {getTermTypeLabel(term.term_type)}
                  </span>
                </td>
                <td className="px-[18px] py-4 text-sm leading-5 text-slate-600">
                  {term.academic_year ?? "—"}
                </td>
                <td className="px-[18px] py-4 text-sm leading-5 text-slate-600">
                  {formatDate(term.start_date)} – {formatDate(term.end_date)}
                </td>
                <td className="px-[18px] py-4 text-sm leading-5 text-slate-600">
                  {formatDate(term.course_registration_start_date)} –{" "}
                  {formatDate(term.course_registration_end_date)}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <span
                    className={`inline-flex min-h-6 items-center rounded-full px-2 py-[3px] text-xs font-bold ${
                      term.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {term.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-[18px] py-4 text-right">
                  <div className="flex justify-end gap-0.5 whitespace-nowrap">
                    <Link
                      className={actionButtonClassName}
                      to={`/academics/terms/edit/${term.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className={`${actionButtonClassName} text-red-700 hover:bg-red-50 hover:text-red-800`}
                      type="button"
                      onClick={() => onDelete(term.id)}
                      disabled={isActivating || isDeleting}
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                    {!term.is_active && (
                      <button
                        className={`${actionButtonClassName} text-blue-700`}
                        type="button"
                        onClick={() => onActivate(term.id)}
                        disabled={isActivating || isDeleting}
                      >
                        {isActivating ? "Activating…" : "Set active"}
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

export default TermTable;
