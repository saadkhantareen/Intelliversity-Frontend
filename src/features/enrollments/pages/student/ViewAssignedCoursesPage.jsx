import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalCourseSection from '../../components/PortalCourseSection';
import CurrentPortalCoursesTable from '../../components/CurrentPortalCoursesTable';
import { useStudentCoursePortal } from '../../hooks/useStudentCoursePortal';

const ViewAssignedCoursesPage = () => {
  const navigate = useNavigate();
  const {
    registeredCourses,
    isLoading,
    actionId,
    error,
    notice,
  } = useStudentCoursePortal();

  const handleViewMarks = (enrollmentId, record) => {
    // Course offering ID extract karke student marks page par redirect karein
    const courseOfferingId = record?.course_offering || record?.id || enrollmentId;
    navigate(`/student-marks/${courseOfferingId}`);
  };

  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="view-courses-title"
    >
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
          Student portal
        </p>
        <h1
          id="view-courses-title"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          View courses & marks
        </h1>
        <p className="mt-2.5 text-[0.9375rem] leading-6 text-slate-500">
          Review all your assigned and registered courses and check assessment marks.
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
          Loading your courses…
        </div>
      ) : (
        <div className="grid gap-10">
          <PortalCourseSection
            title="Assigned and registered courses"
            description="Here is the detailed list of courses currently fetched for your profile."
          >
            <CurrentPortalCoursesTable
              records={registeredCourses}
              showFaculty
              showStatus={false}
              actionId={actionId}
              actionLabel="View marks"
              actionInProgressLabel="Loading…"
              emptyTitle="No courses found."
              emptyDescription="You are currently not enrolled in any courses."
              onAction={(id) => {
                const record = registeredCourses.find((r) => r.id === id);
                handleViewMarks(id, record);
              }}
            />
          </PortalCourseSection>
        </div>
      )}
    </section>
  );
};

export default ViewAssignedCoursesPage;