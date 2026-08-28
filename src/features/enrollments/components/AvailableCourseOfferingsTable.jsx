const actionButtonClassName =
  "inline-flex min-h-8 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-blue-800 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

const AvailableCourseOfferingsTable = ({
  courseOfferings,
  showFaculty,
  actionId,
  actionLabel,
  actionInProgressLabel,
  onAction,
}) => {
  if (!courseOfferings.length) {
    return (
      <div className="grid min-h-[168px] place-content-center px-8 py-8 text-center text-sm text-slate-500">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          No courses are currently available.
        </p>
        <span className="text-sm">
          Check again when course offerings become available for your portal.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full border-collapse text-left ${showFaculty ? "min-w-[1040px]" : "min-w-[860px]"}`}
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
              className="whitespace-nowrap bg-slate-50 px-[18px] py-4 text-right text-xs font-bold uppercase tracking-[0.04em] text-slate-600"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {courseOfferings.map((courseOffering) => {
            const isActing = actionId === courseOffering.id;
            const courseLabel = [
              courseOffering.course?.code,
              courseOffering.course?.name,
            ]
              .filter(Boolean)
              .join(" — ");
            const batchSemester = courseOffering.batch?.current_semester
              ? `Semester ${courseOffering.batch.current_semester}`
              : "";

            return (
              <tr
                key={courseOffering.id}
                className="border-b border-slate-200 last:border-b-0 hover:bg-blue-50/30"
              >
                <td className="max-w-[360px] px-[18px] py-4 text-sm leading-5 text-slate-700">
                  <strong className="block font-semibold text-slate-800">
                    {courseLabel || "—"}
                  </strong>
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {courseOffering.term?.name || "—"}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  <strong className="block font-semibold text-slate-800">
                    {courseOffering.batch?.name || "—"}
                  </strong>
                  {batchSemester && (
                    <span className="mt-0.5 block text-[0.8125rem] text-slate-500">
                      {batchSemester}
                    </span>
                  )}
                </td>
                <td className="px-[18px] py-4 text-sm text-slate-600">
                  {courseOffering.section?.name || "—"}
                </td>
                {showFaculty && (
                  <td className="px-[18px] py-4 text-sm text-slate-600">
                    {courseOffering.faculty?.name || "Not assigned"}
                  </td>
                )}
                <td className="px-[18px] py-4 text-right">
                  <button
                    className={actionButtonClassName}
                    type="button"
                    onClick={() => onAction(courseOffering.id)}
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

export default AvailableCourseOfferingsTable;
