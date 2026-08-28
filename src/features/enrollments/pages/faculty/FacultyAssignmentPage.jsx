import AvailableCourseOfferingsTable from "../../components/AvailableCourseOfferingsTable";
import CurrentPortalCoursesTable from "../../components/CurrentPortalCoursesTable";
import PortalCourseSection from "../../components/PortalCourseSection";
import { useFacultyCoursePortal } from "../../hooks/useFacultyCoursePortal";

const FacultyAssignmentPage = () => {
  const {
    availableCourses,
    assignedCourses,
    isLoading,
    actionId,
    error,
    notice,
    assignCourse,
    removeAssignedCourse,
  } = useFacultyCoursePortal();

  const handleAssignCourse = async (courseOfferingId) => {
    try {
      await assignCourse(courseOfferingId);
    } catch {
      // The hook exposes the request error in the page-level alert.
    }
  };

  const handleRemoveAssignedCourse = async (assignmentId) => {
    const shouldRemove = window.confirm(
      "Remove this course assignment? This action cannot be undone.",
    );
    if (!shouldRemove) return;

    try {
      await removeAssignedCourse(assignmentId);
    } catch {
      // The hook exposes the request error in the page-level alert.
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="faculty-courses-title"
    >
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Faculty portal
        </p>
        <h1
          id="faculty-courses-title"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          My course assignments
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          Review the course offerings available to you and manage the courses
          you have already selected.
        </p>
      </header>

      {error && (
        <p
          className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          className="mb-5 border-l-[3px] border-emerald-700 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-800"
          role="status"
        >
          {notice}
        </p>
      )}

      {isLoading ? (
        <div
          className="grid min-h-[240px] place-content-center px-8 py-8 text-sm text-slate-500"
          role="status"
        >
          Loading your course assignments…
        </div>
      ) : (
        <div className="grid gap-10">
          <PortalCourseSection
            title="Available courses to assign"
            description="Select a course offering to submit it for faculty assignment."
          >
            <AvailableCourseOfferingsTable
              courseOfferings={availableCourses}
              showFaculty={false}
              actionId={actionId}
              actionLabel="Assign course"
              actionInProgressLabel="Assigning…"
              onAction={handleAssignCourse}
            />
          </PortalCourseSection>

          <PortalCourseSection
            title="Assigned courses"
            description="These course offerings are currently assigned or awaiting approval."
          >
            <CurrentPortalCoursesTable
              records={assignedCourses}
              showFaculty={false}
              actionId={actionId}
              actionLabel="Remove"
              actionInProgressLabel="Removing…"
              emptyTitle="No courses have been assigned."
              emptyDescription="Use the available courses section to submit a new assignment."
              onAction={handleRemoveAssignedCourse}
            />
          </PortalCourseSection>
        </div>
      )}
    </section>
  );
};

export default FacultyAssignmentPage;
