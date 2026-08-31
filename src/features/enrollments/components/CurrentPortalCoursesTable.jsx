import React from 'react';

const CurrentPortalCoursesTable = ({
  records = [],
  actionId,
  actionLabel = "Remove",
  actionInProgressLabel = "Removing…",
  emptyTitle = "No courses found.",
  emptyDescription = "There are no courses to display here.",
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <h3 className="text-sm font-bold text-slate-800">{emptyTitle}</h3>
        <p className="mt-1 text-xs text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-4">Course</th>
            <th className="py-3.5 px-4">Term</th>
            <th className="py-3.5 px-4">Batch</th>
            <th className="py-3.5 px-4">Section</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {records.map((record) => {
            // Handle structure whether course info is flattened or nested under course_offering
            const courseName = record.course_offering_details?.course_name || record.course_name || record.course_code || "PF";
            const termName = record.course_offering_details?.term_name || record.term_name || record.term || "—";
            const batchName = record.course_offering_details?.batch_name || record.batch_name || "—";
            const sectionName = record.course_offering_details?.section_name || record.section_name || "—";
            const status = record.status || "pending";
            
            const rowKey = record.id;
            const isProcessing = actionId === rowKey || actionId === record.course_offering;

            return (
              <tr key={rowKey} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-900">{courseName}</td>
                <td className="py-4 px-4 text-slate-600">{termName}</td>
                <td className="py-4 px-4 text-slate-600">{batchName}</td>
                <td className="py-4 px-4 text-slate-600">{sectionName}</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/60">
                    {status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  {/* Secondary Action: Show Students */}
                  {onSecondaryAction && (
                    <button
                      onClick={() => onSecondaryAction(record)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {secondaryActionLabel || "Show students"}
                    </button>
                  )}

                  {/* Primary Action: Remove */}
                  {onAction && (
                    <button
                      onClick={() => onAction(record.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? actionInProgressLabel : actionLabel}
                    </button>
                  )}
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