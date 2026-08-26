import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FacultyAssignmentTable from '../../components/FacultyAssignmentTable';
import { useEnrollmentRelationLookups } from '../../hooks/useEnrollmentRelationLookups';
import { useFacultyAssignments } from '../../hooks/useFacultyAssignments';

const FacultyAssignmentList = () => {
  const { facultyAssignments, isLoading, error, deletingId, deleteFacultyAssignment } =
    useFacultyAssignments();
  const {
    courseOfferings,
    profiles: faculties,
    isLoading: isLoadingLookups,
    error: lookupsError,
  } = useEnrollmentRelationLookups('faculty');

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm(
      'Delete this faculty assignment? This action cannot be undone.'
    );
    if (!shouldDelete) return;

    try {
      await deleteFacultyAssignment(id);
      toast.success('Faculty assignment deleted successfully.');
    } catch {
      // The hook exposes the request error in the page-level alert.
    }
  };

  const pageError = error || lookupsError;

  return (
    <section
      className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      aria-labelledby="faculty-assignments-title"
    >
      <header className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
            Academic setup
          </p>
          <h1
            id="faculty-assignments-title"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Faculty assignments
          </h1>
          <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-6 text-slate-500">
            Assign faculty members to course offerings and manage each approval status.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-blue-800 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 motion-reduce:transition-none sm:w-auto"
          to="/enrollments/faculty-assignments/create"
        >
          Add faculty assignment
        </Link>
      </header>

      {pageError && (
        <p
          className="mb-5 border-l-[3px] border-red-700 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800"
          role="alert"
        >
          {pageError}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {isLoading || isLoadingLookups ? (
          <div
            className="grid min-h-[180px] place-content-center px-8 py-8 text-sm text-slate-500"
            role="status"
          >
            Loading faculty assignments…
          </div>
        ) : (
          <FacultyAssignmentTable
            facultyAssignments={facultyAssignments}
            courseOfferings={courseOfferings}
            faculties={faculties}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  );
};

export default FacultyAssignmentList;
