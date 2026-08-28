import AvailableCourseOfferingsTable from '../../components/AvailableCourseOfferingsTable';
import CurrentPortalCoursesTable from '../../components/CurrentPortalCoursesTable';
import PortalCourseSection from '../../components/PortalCourseSection';
import { useStudentCoursePortal } from '../../hooks/useStudentCoursePortal';

const StudentRegistrationPage = () => {
  const {
    availableCourses,
    registeredCourses,
    isLoading,
    actionId,
    error,
    notice,
    registerCourse,
    dropRegisteredCourse,
  } = useStudentCoursePortal();

  const handleRegisterCourse = async (courseOfferingId) => {
    try {
      await registerCourse(courseOfferingId);
    } catch {
      // The hook exposes the request error in the page-level alert.
    }
  };

  const handleDropRegisteredCourse = async (enrollmentId) => {
    const shouldDrop = window.confirm('Drop this course? This action cannot be undone.');
    if (!shouldDrop) return;

    try {
      await dropRegisteredCourse(enrollmentId);
    } catch {
      // The hook exposes the request error in the page-level alert.
    }
  };

  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="student-courses-title"
    >
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Student portal
        </p>
        <h1
          id="student-courses-title"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          My course registration
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          Register for available course offerings and manage the courses in which you are already
          enrolled.
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
          Loading your course registration…
        </div>
      ) : (
        <div className="grid gap-10">
          <PortalCourseSection
            title="Available courses to register"
            description="Choose an available offering to add it to your registered courses."
          >
            <AvailableCourseOfferingsTable
              courseOfferings={availableCourses}
              showFaculty
              actionId={actionId}
              actionLabel="Register"
              actionInProgressLabel="Registering…"
              onAction={handleRegisterCourse}
            />
          </PortalCourseSection>

          <PortalCourseSection
            title="Registered courses"
            description="Review the courses in your current registration and drop one when necessary."
          >
            <CurrentPortalCoursesTable
              records={registeredCourses}
              showFaculty
              actionId={actionId}
              actionLabel="Drop course"
              actionInProgressLabel="Dropping…"
              emptyTitle="You are not registered for any courses."
              emptyDescription="Use the available courses section to register for an offering."
              onAction={handleDropRegisteredCourse}
            />
          </PortalCourseSection>
        </div>
      )}
    </section>
  );
};

export default StudentRegistrationPage;
